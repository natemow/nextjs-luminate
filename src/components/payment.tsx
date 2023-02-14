
import { FormEvent, ReactElement, useContext, useState } from 'react'
import { config, API, formatCurrency, getProcessingFee } from '@/lib/utility';
import Context from '@/components/context'

export function Payment(): ReactElement {

  // @ts-ignore
  const { state, setState, getStateUpdate } = useContext(Context)

  // Cookie checkbox change.
  let [checkedCookie, setCheckedRemember] = useState(state['donation'].remember_me)
  const handleChangeCookie = async () => {
    checkedCookie = !checkedCookie
    setCheckedRemember(checkedCookie)

    const update = getStateUpdate()
    update.donation.remember_me = checkedCookie

    setState(update)
  }

  // Method radio change.
  let [method, setMethod] = useState(state['meta'].method)
  const handleChangeMethod = async (e: FormEvent) => {

    const input = e.target as HTMLFormElement

    setMethod(input.value)

    const update = getStateUpdate()
    update.meta.method = input.value

    setState(update)
  }

  // Fee checkbox change.
  let [checkedFee, setCheckedFee] = useState(state['meta'].fee)
  const handleChangeFee = async () => {
    checkedFee = !checkedFee
    setCheckedFee(checkedFee)

    const update = getStateUpdate()
    update.meta.fee = checkedFee

    setState(update)
  }

  // Donate button click.
  const handleClick = async (e: FormEvent) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement

    console.log(state)

    // let response
    // switch (method) {
    //   case 'card':
    //     delete state['donation'].extproc;
    //     delete state['donation'].status;
    //
    //     response = API.setPaymentCard(state['donation']);
    //     break
    //
    //   case 'paypal':
    //     state['donation'].extproc = 'paypal';
    //     state['donation'].status = 'error_paypal';
    //
    //     response = API.setPaymentPaypal(state['donation']);
    //     break
    // }
    //
    // response.then(data => {
    //   if (data.errors) {
    //     // finish_error_redirect
    //   }
    //
    //   // finish_success_redirect
    //   console.log(data)
    // })
  }


  // Set display amount and disabled state.
  const amount = checkedFee ? state['meta'].amountWithFee : state['meta'].amount,
        disabled = !state['donation'].level_id || !state['meta'].amount

  // Render.
  return (
    <>
      <section data-section="payment" data-toggle={disabled}>
        <div className="input -radio">
          <label htmlFor="method-1">Credit card
            <input id="method-1" type="radio" name="method" value="card" checked={method === 'card'} onChange={handleChangeMethod} />
            <span />
          </label>
        </div>
        <div className="input -radio">
          <label htmlFor="method-2">PayPal
            <input id="method-2" type="radio" name="method" value="paypal" checked={method === 'paypal'} onChange={handleChangeMethod} />
            <span />
          </label>
        </div>
      </section>

      <section data-section="payment" data-toggle={disabled}>
        TODO: {method} payment goes here
      </section>

      <section data-section="cookie" data-toggle={disabled}>
        <div className="input -checkbox">
          <label htmlFor="cookie">Remember me
            <input id="cookie" type="checkbox" checked={checkedCookie} onChange={handleChangeCookie} />
            <span />
          </label>
        </div>
      </section>

      <section data-section="fee" data-toggle={disabled}>
        <div className="input -checkbox">
          <label htmlFor="fee">I want 100% of my donation to go to the {config.org}. I will add {formatCurrency(getProcessingFee(state['meta'].amount))} to my donation to cover credit card transaction fees.
            <input id="fee" type="checkbox" checked={checkedFee} onChange={handleChangeFee} />
            <span />
          </label>
        </div>
      </section>

      <section data-section="action" data-toggle={disabled}>
        <div className="input">
          <button onClick={handleClick} disabled={disabled} className={!disabled ? '-active' : ''}>Donate {formatCurrency(amount)}</button>
        </div>
      </section>
    </>
  )
}
