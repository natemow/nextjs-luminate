
import { FormEvent, ReactElement, useContext, useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { config, Forms } from '@/lib/utility'
import { Context } from '@/components/context'
import { FormText, FormCheckbox, FormSelect, FormAddress } from '@/components/form'

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

    } else if (input.name.indexOf('tribute.notify.') === 0) {
      // Remove ecard data.
      prune(update, 'ecard.')

      if (!update.donation['tribute.notify.address.country']) {
        update.donation['tribute.notify.address.country'] = config.defaultCountry
      }
      if (input.name === 'tribute.notify.address.country') {
        delete update.donation['tribute.notify.address.state']
      }
    }

    update.donation[input.name] = input.value

    setState(update)
  }

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
              <FormText props={{ id: 'ecard.recipients', label: t('labelEcardRecipient'), callback: handleChangeNotification }} />
              <FormText props={{ id: 'ecard.subject', label: t('labelEcardSubject'), callback: handleChangeNotification }} />
              {/*
                state['donation']['ecard.send'];
                state['donation']['ecard.send_date'];
                state['donation']['ecard.id'];
                state['donation']['ecard.message'];
                state['donation']['ecard.copy_sender'];
              */}
            </section>

            <section data-section="mail" data-toggle={notify !== 'mail'}>
              <FormAddress props={{ prefix: 'tribute.notify', callback: handleChangeNotification, nameCount: 1 }} />
              {/*
                state['donation']['tribute.message.body'];
                state['donation']['tribute.message.closing'];
                state['donation']['tribute.message.signature'];
              */}
            </section>
          </div>
        </div>

      </fieldset>
    </>
  )
}
