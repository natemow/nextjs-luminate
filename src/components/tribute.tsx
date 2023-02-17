
import { FormEvent, ReactElement, useContext, useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { Forms } from '@/lib/utility'
import Context from '@/components/context'
import { FormText, FormCheckbox, FormSelect } from '@/components/form'

export function Tribute(): ReactElement {

  const { t } = useTranslation('common')

  // @ts-ignore
  const { state, setState, getStateUpdate, setLoading } = useContext(Context)

  // Shared form update logic.
  const getFormUpdate = (formId) => {

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
      delete update.donation['tribute.type']
      delete update.donation['tribute.honoree.name.first']
      delete update.donation['tribute.honoree.name.last']

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
    update.donation[input.name] = input.value

    setState(update)
  }

  // state['donation']['ecard.send'];
  // state['donation']['ecard.send_date'];
  // state['donation']['ecard.id'];

  // state['donation']['ecard.message'];
  // state['donation']['ecard.copy_sender'];
  //
  // state['donation']['tribute.message.body'];
  // state['donation']['tribute.message.closing'];
  // state['donation']['tribute.message.signature'];


  // Render.
  return (
    <>
      <section data-section="tribute">
        <FormCheckbox id="tribute" label={t('labelTribute')} callback={handleChangeTribute} checked={tribute} />
      </section>

      <fieldset data-section="tribute" data-toggle={!tribute}>
        <legend>{t('headingTribute')}</legend>

        <div className="tribute -border">
          <div className="-inline">
            <div className="input -offset-label">
              <label htmlFor="tribute.type">{t('labelTributeType')}</label>
              <select onChange={handleChangeTributee} id="tribute.type" name="tribute.type">
                <option value="tribute">{t('optHonor')}</option>
                <option value="memorial">{t('optMemory')}</option>
              </select>
            </div>

            <FormText id="tribute.honoree.name.first" label={t('labelFname')} callback={handleChangeTributee} />
            <FormText id="tribute.honoree.name.last" label={t('labelLname')} callback={handleChangeTributee} />
          </div>

          <div className="notify">
            <FormSelect id="notify" label={t('labelTributeNotify')} callback={handleChangeNotify} options={[
              <option key="" value="">{t('optNo')}</option>,
              <option key="ecard" value="ecard">{t('optEcard')}</option>,
              <option key="value" value="mail">{t('optMail')}</option>
            ]} />

            <section data-section="ecard" data-toggle={notify !== 'ecard'}>
              <FormText id="ecard.recipients" label={t('labelEcardRecipient')} callback={handleChangeNotification} />
              <FormText id="ecard.subject" label={t('labelEcardSubject')} callback={handleChangeNotification} />
            </section>

            <section data-section="mail" data-toggle={notify !== 'mail'}>
              <FormText id="tribute.notify.name.full" label={t('labelMailName')} callback={handleChangeNotification} />
              <div className="-inline">
                <FormText id="tribute.notify.address.street1" label={t('labelAddr1')} callback={handleChangeNotification} />
                <FormText id="tribute.notify.address.street2" label={t('labelAddr2')} callback={handleChangeNotification} />
              </div>
              <div className="-inline">
                <FormText id="tribute.notify.address.city" label={t('labelAddrCity')} callback={handleChangeNotification} />
                <FormSelect id="tribute.notify.address.state" label={t('labelAddrState')} callback={handleChangeNotification} options={[]} />
              </div>
              <div className="-inline">
                <FormText id="tribute.notify.address.zip" label={t('labelAddrZip')} callback={handleChangeNotification} />
                <FormSelect id="tribute.notify.address.country" label={t('labelAddrCountry')} callback={handleChangeNotification} options={[]} />
              </div>
            </section>
          </div>
        </div>

      </fieldset>
    </>
  )
}
