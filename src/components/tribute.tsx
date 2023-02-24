
import { FormEvent, ReactElement, useContext, useState, useEffect } from 'react'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { config, Forms, formatDate } from '@/lib/utility'
import { Context } from '@/components/context'
import { FormText, FormTextarea, FormCheckbox, FormSelect, FormAddress, FormDate, FormRadio } from '@/components/form'

export function Tribute(): ReactElement {

  const { t } = useTranslation('common')

  // @ts-ignore
  const { state, setState, getStateUpdate, pruneState, setLoading } = useContext(Context)

  // Shared form update logic.
  const getFormUpdate = (formId: string) => {

    const update = getStateUpdate()
    update.donation.form_id = formId

    // Make sure Context.setLevels() can run.
    setLoading(true)

    return update
  }

  // Tribute change.
  let [tribute, setTribute] = useState(false)
  const handleChangeTribute = async () => {
    tribute = !tribute
    setTribute(tribute)

    let formId = Forms[state['meta'].frequency].standard
    if (tribute) {
      formId = Forms[state['meta'].frequency].tribute
    }

    const update = getFormUpdate(formId)

    if (tribute) {
      // Default with previous tributee information, i.e. user has toggled "Give in honor" checkbox multiple times.
      update.donation['tribute.type'] = 'tribute'
      Object.keys(tributee).forEach(t => {
        update.donation[t] = tributee[t]
      })

    } else {
      // Remove tributee, mail and ecard data.
      pruneState(update, 'tribute.')
      pruneState(update, 'ecard.')
    }

    setState(update)
  }

  // Notify change.
  const [notify, setNotify] = useState('')
  const handleChangeNotify = async (e: FormEvent) => {

    const input = e.target as HTMLFormElement
    setNotify(input.value)

    let formId = Forms[state['meta'].frequency].tribute
    if (input.value === 'mail') {
      formId = Forms[state['meta'].frequency].tributeMail
    }

    const update = getFormUpdate(formId)

    update.meta.notify = input.value

    // Remove mail and ecard data.
    if (!update.meta.notify) {
      pruneState(update, 'tribute.notify.')
      pruneState(update, 'tribute.message.')
      pruneState(update, 'ecard.')
    } else if (update.meta.notify === 'ecard') {
      pruneState(update, 'tribute.notify.')
      pruneState(update, 'tribute.message.')
    } else if (update.meta.notify === 'mail') {
      pruneState(update, 'ecard.')
    }

    setState(update)
  }

  // Tributee change.
  const [tributee, setTributee] = useState({})
  const handleChangeTributee = async (e: FormEvent) => {

    const input = e.target as HTMLFormElement

    tributee[input.name] = input.value
    setTributee(tributee)

    const update = getStateUpdate()
    update.donation[input.name] = input.value

    setState(update)
  }

  // Notification change.
  const [notification, setNotification] = useState({})
  const handleChangeNotification = async (e: FormEvent) => {

    const input = e.target as HTMLFormElement

    notification[input.name] = input.value
    setNotification(notification)

    const update = getStateUpdate()

    if (input.name.indexOf('ecard.') === 0) {
      // Remove mail data.
      pruneState(update, 'tribute.notify.')

      // Update send status and date.
      update.donation['ecard.send'] = true
      if (!update.donation['ecard.send_date']) {
        update.donation['ecard.send_date'] = formatDate(new Date())
      }

    } else if (input.name.indexOf('tribute.notify.') === 0) {
      // Remove ecard data.
      pruneState(update, 'ecard.')

      // Update country/state.
      if (!update.donation['tribute.notify.address.country']) {
        update.donation['tribute.notify.address.country'] = config.countryDefault
      }
      if (input.name === 'tribute.notify.address.country') {
        delete update.donation['tribute.notify.address.state']
      }
    } else if (input.name.indexOf('tribute.message.') === 0) {
      // Remove ecard data.
      pruneState(update, 'ecard.')
    }

    update.donation[input.name] = input.value

    setState(update)
  }

  // Notification date change.
  const handleChangeNotificationDate = async (props: object, date: Date) => {

    const update = getStateUpdate();

    // @ts-ignore
    update.donation[props.id] = formatDate(date)

    setState(update)
  }

  // Copy-me change.
  let [copy, setCopy] = useState(true)
  const handleChangeCopy = async (e: FormEvent) => {
    copy = !copy
    setCopy(copy)

    const input = e.target as HTMLFormElement

    const update = getStateUpdate()

    update.donation[input.name] = copy

    setState(update)
  }

  // Ecard change.
  let ecards = {}
  const [ecard, setEcard] = useState(state['donation']['ecard.id'])
  const handleChangeEcard = async (e: FormEvent) => {

    const input = e.target as HTMLFormElement

    let value = input.value
    switch (input.tagName) {
      case 'IMG':
      case 'DIV':
        value = input.getAttribute('data-ecard')
        break
    }

    const update = getStateUpdate()

    update.donation['ecard.id'] = parseInt(value)

    setState(update)
    setEcard(value)
  }

  // Helper function to build ecard inputs.
  const getECards = () => {

    // Set ecards.
    ecards = {}
    const data = t('optsEcard', {}, { returnObjects: true })
    for (let i = 0; i < data.length; i++) {
      // @ts-ignore
      const id = data[i].id, label = data[i].label, thumbnail = data[i].thumbnail, fullsize = data[i].fullsize
      ecards[id] = { id, label, thumbnail, fullsize }
    }

    const options = []
    Object.keys(ecards).forEach(id => {
      const data = ecards[id]

      options.push(
        <div key={data.id} className={'ecard' + (data.id === ecard ? ' -active' : '')} onClick={handleChangeEcard} data-ecard={data.id}>
          <Image unoptimized={true} src={data.thumbnail} alt={data.label} width="150" height="150" data-ecard={data.id} />
          <FormRadio props={{ id: data.id, label: data.label, name: 'ecard.id', value: data.id, checked: (ecard === data.id), callback: handleChangeEcard }} />
        </div>
      )
    });

    return options
  }

  // Preview click.
  let [ecardImage, setEcardImage] = useState(null)
  let [preview, setPreview] = useState(false)
  const handlePreview = async (e: FormEvent) => {
    e.preventDefault()

    preview = !preview
    setPreview(preview)

    Object.keys(ecards).forEach(id => {
      const data = ecards[id]
      if (data.id === ecard) {
        ecardImage = (<Image unoptimized={true} src={data.fullsize} alt={data.label} width="500" height="500" data-ecard={data.id} />)
        setEcardImage(ecardImage)
      }
    })
  }


  useEffect(() => {
    document.documentElement.setAttribute('data-modal', preview.toString())
  })

  // Render.
  return (
    <>
      <section data-section="tribute">
        <FormCheckbox props={{ id: 'tribute', label: t('labelTribute'), callback: handleChangeTribute, checked: tribute }} />
      </section>

      <fieldset data-section="tribute" data-toggle={!tribute}>
        <legend>{t('headingTribute')}</legend>

        <div className="tribute -border">
          <div className="-inline">
            <FormSelect props={{ id: 'tribute.type', label: t('labelTributeType'), callback: handleChangeTributee, className: '-offset-label', options: [
                <option key="tribute" value="tribute">{t('optHonor')}</option>,
                <option key="memorial" value="memorial">{t('optMemory')}</option>
              ] }} />
            <FormText props={{ id: 'tribute.honoree.name.first', label: t('labelFname'), callback: handleChangeTributee }} />
            <FormText props={{ id: 'tribute.honoree.name.last', label: t('labelLname'), callback: handleChangeTributee }} />
          </div>

          <div className="notify">
            <FormSelect props={{ id: 'notify', label: t('labelTributeNotify'), callback: handleChangeNotify, options: [
                <option key="" value="">{t('optNo')}</option>,
                <option key="ecard" value="ecard">{t('optEcard')}</option>,
                <option key="value" value="mail">{t('optMail')}</option>
              ] }} />

            {/* Ecard notification. */}
            <section data-section="ecard" data-toggle={notify !== 'ecard'}>
              <div className="ecards -inline">
                {getECards()}
              </div>
              <FormDate props={{ id: 'ecard.send_date', label: t('labelSendDate'), callback: handleChangeNotificationDate }} />
              <div className="-inline">
                <FormText props={{ id: 'ecard.recipients', label: t('labelRecipient'), callback: handleChangeNotification }} />
                <FormText props={{ id: 'ecard.subject', label: t('labelSubject'), callback: handleChangeNotification }} />
              </div>
              <FormTextarea props={{ id: 'ecard.message', label: t('labelMessage'), callback: handleChangeNotification, maxlength: 250 }} />
              <FormCheckbox props={{ id: 'ecard.copy_sender', label: t('labelCopySender'), callback: handleChangeCopy, checked: copy }} />

              {/* Ecard preview. */}
              <div className="input">
                <button onClick={handlePreview} aria-label="preview">{t('labelPreview')}</button>
                <div className="modal -preview" aria-labelledby="preview" data-toggle={!preview}>
                  <div className="modal-inner">
                    <div className="-inline -right">
                      <button onClick={handlePreview}>{t('labelClose')}</button>
                    </div>
                    <table>
                      <tbody>
                        <tr>
                          <th>{t('labelSendDate')}:</th>
                          <td>{state['donation']['ecard.send_date']}</td>
                        </tr>
                        <tr>
                          <th>{t('labelRecipient')}:</th>
                          <td>{state['donation']['ecard.recipients']}</td>
                        </tr>
                        <tr>
                          <th>{t('labelSubject')}:</th>
                          <td>{state['donation']['ecard.subject']}</td>
                        </tr>
                        <tr>
                          <th>{t('labelMessage')}:</th>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="message">
                      {ecardImage}
                      <p>{state['donation']['ecard.message']}</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="help" dangerouslySetInnerHTML={{ __html: t('helpNotifyLimit') }}></p>
            </section>

            {/* Mail notification. */}
            <section data-section="mail" data-toggle={notify !== 'mail'}>
              <FormAddress props={{ prefix: 'tribute.notify', callback: handleChangeNotification, nameCount: 1 }} />
              <FormTextarea props={{ id: 'tribute.message.body', label: t('labelMessage'), callback: handleChangeNotification, maxlength: 250 }} />
              <div className="-inline">
                <FormText props={{ id: 'tribute.message.closing', label: t('labelClosing'), callback: handleChangeNotification, placeholder: t('phClosing') }} />
                <FormText props={{ id: 'tribute.message.signature', label: t('labelSignature'), callback: handleChangeNotification }} />
              </div>
              <p className="help" dangerouslySetInnerHTML={{ __html: t('helpNotifyLimit') }}></p>
            </section>
          </div>
        </div>

      </fieldset>
    </>
  )
}
