
import { FormEvent, ReactElement, useContext, useState } from 'react'
import { Forms } from '@/lib/utility'
import Context from '@/components/context'

export function Tribute(): ReactElement {

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

  // Tribute checkbox change.
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

  // Notify select change.
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

  // Tributee input event.
  const [tributee, setTributee] = useState({})
  const handleChangeTributee = async (e: FormEvent) => {

    const input = e.target as HTMLFormElement

    tributee[input.name] = input.value
    setTributee(tributee)

    const update = getStateUpdate()
    update.donation[input.name] = input.value

    setState(update)
  }

  // state['donation']['tribute.notify.name.full'];
  // state['donation']['tribute.notify.address.street1'];
  // state['donation']['tribute.notify.address.street2'];
  // state['donation']['tribute.notify.address.city'];
  // state['donation']['tribute.notify.address.state'];
  // state['donation']['tribute.notify.address.zip'];
  // state['donation']['tribute.notify.address.country'];
  //
  // state['donation']['ecard.send'];
  // state['donation']['ecard.send_date'];
  // state['donation']['ecard.id'];
  // state['donation']['ecard.recipients'];
  // state['donation']['ecard.subject'];
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
        <div className="input -checkbox">
          <label htmlFor="tribute">Give in honor or memory of someone
            <input id="tribute" type="checkbox" checked={tribute} onChange={handleChangeTribute} />
            <span />
          </label>
        </div>
      </section>

      <fieldset data-section="tribute" data-toggle={!tribute}>
        <legend>Tributee Information</legend>

        <div className="tribute -border">
          <div className="-inline">
            <div className="input -offset-label">
              <label htmlFor="tribute.type">Tribute type</label>
              <select onChange={handleChangeTributee} name="tribute.type">
                <option value="tribute">In Honor of</option>
                <option value="memorial">In Memory of</option>
              </select>
            </div>
            <div className="input">
              <label htmlFor="tribute.honoree.name.first">First name</label>
              <input onInput={handleChangeTributee} name="tribute.honoree.name.first" type="text" />
            </div>
            <div className="input">
              <label htmlFor="tribute.honoree.name.last">Last name</label>
              <input onInput={handleChangeTributee} name="tribute.honoree.name.last" type="text" />
            </div>
          </div>

          <div className="notify">
            <div className="input">
              <label htmlFor="notify">Would you like to notify someone of your gift?</label>
              <select id="notify" onChange={handleChangeNotify}>
                <option value="">No</option>
                <option value="ecard">Yes, by eCard</option>
                <option value="mail">Yes, by Mail</option>
              </select>
            </div>

            <section data-section="ecard" data-toggle={notify !== 'ecard'}>
              <p>TODO: {notify}</p>
            </section>

            <section data-section="mail" data-toggle={notify !== 'mail'}>
              <p>TODO: {notify}</p>
            </section>
          </div>

        </div>

      </fieldset>
    </>
  )
}
