
import { FormEvent, ReactElement, useContext, useState, useEffect } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { config, Forms } from '@/lib/utility'
import { Context } from '@/components/context'
import { FormText, FormTextarea, FormCheckbox, FormSelect, FormAddress, FormDate, FormRadio } from '@/components/form'

export function Tribute(): ReactElement {

  const { t } = useTranslation('common')

  // @ts-ignore
  const { state, setState, getStateUpdate, setLoading } = useContext(Context)

  // Shared form update logic.
  const getFormUpdate = (formId: string) => {

    const update = getStateUpdate()
    update.donation.form_id = formId

    // Make sure Context.setLevels() can run.
    setLoading(true)

    return update
  }

  // Helper function to prune keys from update.donation.
  const prune = (update: object, prefix: string) => {
    // @ts-ignore
    Object.keys(update.donation).forEach(key => {
      if (key.indexOf(prefix) === 0) {
        // @ts-ignore
        delete update.donation[key]
      }
    });
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
      prune(update, 'tribute.')
      prune(update, 'ecard.')
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
      prune(update, 'tribute.notify.')
      prune(update, 'tribute.message.')
      prune(update, 'ecard.')
    } else if (update.meta.notify === 'ecard') {
      prune(update, 'tribute.notify.')
      prune(update, 'tribute.message.')
    } else if (update.meta.notify === 'mail') {
      prune(update, 'ecard.')
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
      prune(update, 'tribute.notify.')

      // Update send status.
      update.donation['ecard.send'] = true

    } else if (input.name.indexOf('tribute.notify.') === 0) {
      // Remove ecard data.
      prune(update, 'ecard.')

      // Update country/state.
      if (!update.donation['tribute.notify.address.country']) {
        update.donation['tribute.notify.address.country'] = config.defaultCountry
      }
      if (input.name === 'tribute.notify.address.country') {
        delete update.donation['tribute.notify.address.state']
      }
    } else if (input.name.indexOf('tribute.message.') === 0) {
      // Remove ecard data.
      prune(update, 'ecard.')
    }

    update.donation[input.name] = input.value

    setState(update)
  }

  // Notification date change.
  const handleChangeNotificationDate = async (props: object, date: Date) => {

    const update = getStateUpdate(),
          fmtYY = date.toLocaleDateString('en-us', { year:'numeric' }),
          fmtMM = date.toLocaleDateString('en-us', { month:'2-digit' }),
          fmtDD = date.toLocaleDateString('en-us', { day:'2-digit' })

    // @ts-ignore
    update.donation[props.id] = `${fmtYY}-${fmtMM}-${fmtDD}`

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

    update.donation['ecard.id'] = value

    setState(update)
    setEcard(value)
  }

  // Helper function to build ecard inputs.
  const getECards = () => {

    const data = t('optsEcard', {}, { returnObjects: true }),
          options = []

    for (let i = 0; i < data.length; i++) {
            // @ts-ignore
      const value = data[i].id,
            // @ts-ignore
            label = data[i].label,
            // @ts-ignore
            image = data[i].thumbnail

      options.push(
        <div key={value} className={'ecard' + (value === ecard ? ' -active' : '')} onClick={handleChangeEcard} data-ecard={value}>
          <img src={image} alt={label} width="150" height="150" data-ecard={value} />
          <FormRadio props={{ id: value, label: label, name: 'ecard.id', value: value, checked: (ecard === value), callback: handleChangeEcard }} />
        </div>
      )
    }

    return options
  }

  // Preview click.
  let [ecardActive, setEcardActive] = useState(null)
  let [preview, setPreview] = useState(false)
  const handlePreview = async (e: FormEvent) => {
    e.preventDefault()

    preview = !preview
    setPreview(preview)

    const data = t('optsEcard', {}, { returnObjects: true })
    for (let i = 0; i < data.length; i++) {
            // @ts-ignore
      const value = data[i].id,
            // @ts-ignore
            label = data[i].label,
            // @ts-ignore
            image = data[i].fullsize
      if (value === ecard) {
        ecardActive = (<img src={image} alt={label} width="500" height="500" data-ecard={value} />)
      }
    }
    setEcardActive(ecardActive)
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

            <section data-section="ecard" data-toggle={notify !== 'ecard'}>
              <div className="ecards -inline">
                {getECards()}
              </div>
              <FormDate props={{ id: 'ecard.send_date', label: t('labelSendDate'), callback: handleChangeNotificationDate }} />
              <FormText props={{ id: 'ecard.recipients', label: t('labelRecipient'), callback: handleChangeNotification }} />
              <FormText props={{ id: 'ecard.subject', label: t('labelSubject'), callback: handleChangeNotification }} />
              <FormTextarea props={{ id: 'ecard.message', label: t('labelMessage'), callback: handleChangeNotification }} />
              <FormCheckbox props={{ id: 'ecard.copy_sender', label: t('labelCopySender'), callback: handleChangeCopy, checked: copy }} />

              {/* Ecard preview. */}
              <div className="input">
                <button onClick={handlePreview} aria-label="preview">{t('labelPreview')}</button>
                <div className="modal -preview" aria-labelledby="preview" data-toggle={!preview}>
                  <div className="modal-inner">
                    <button onClick={handlePreview} className="help">{t('labelClose')}</button>
                    <dl>
                      <dt>{t('labelSendDate')}:</dt>
                      <dd>{state['donation']['ecard.send_date']}</dd>
                      <dt>{t('labelRecipient')}:</dt>
                      <dd>{state['donation']['ecard.recipients']}</dd>
                      <dt>{t('labelSubject')}:</dt>
                      <dd>{state['donation']['ecard.subject']}</dd>
                      <dt>{t('labelMessage')}:</dt>
                      <dd></dd>
                    </dl>
                    <div className="message">
                      {ecardActive}
                      <p>{state['donation']['ecard.message']}</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="help" dangerouslySetInnerHTML={{ __html: t('helpNotifyLimit') }}></p>
            </section>

            <section data-section="mail" data-toggle={notify !== 'mail'}>
              <FormAddress props={{ prefix: 'tribute.notify', callback: handleChangeNotification, nameCount: 1 }} />
              <FormTextarea props={{ id: 'tribute.message.body', label: t('labelMessage'), callback: handleChangeNotification }} />
              <FormText props={{ id: 'tribute.message.closing', label: t('labelClosing'), callback: handleChangeNotification, placeholder: t('phClosing') }} />
              <FormText props={{ id: 'tribute.message.signature', label: t('labelSignature'), callback: handleChangeNotification }} />
              <p className="help" dangerouslySetInnerHTML={{ __html: t('helpNotifyLimit') }}></p>
            </section>
          </div>
        </div>

      </fieldset>
    </>
  )
}
