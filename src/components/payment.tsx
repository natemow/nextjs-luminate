
import { FormEvent, ReactElement, useContext, useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { API, config, formatCurrency, getProcessingFee} from '@/lib/utility';
import { Context } from '@/components/context'
import {FormCheckbox, FormRadio, FormAddress, FormText, FormSelect} from '@/components/form'

export function Payment(): ReactElement {

  const { t } = useTranslation('common')

  // @ts-ignore
  const { state, setState, getStateUpdate } = useContext(Context)

  // Cookie change.
  let [cookie, setCookie] = useState(state['donation'].remember_me)
  const handleChangeCookie = async () => {
    cookie = !cookie
    setCookie(cookie)

    const update = getStateUpdate()
    update.donation.remember_me = cookie
    update.donation['donor.email_opt_in'] = cookie

    setState(update)
  }

  // Method change.
  let [method, setMethod] = useState(state['meta'].method)
  const handleChangeMethod = async (e: FormEvent) => {

    const input = e.target as HTMLFormElement

    setMethod(input.value)

    const update = getStateUpdate()
    update.meta.method = input.value

    setState(update)
  }

  // Fee change.
  let [fee, setFee] = useState(state['meta'].fee)
  const handleChangeFee = async () => {
    fee = !fee
    setFee(fee)

    const update = getStateUpdate()
    update.meta.fee = fee

    setState(update)
  }

  // Billing change.
  const [billing, setBilling] = useState({})
  const handleChangeBilling = async (e: FormEvent) => {

    const input = e.target as HTMLFormElement

    billing[input.name] = input.value
    setBilling(billing)

    const update = getStateUpdate()
    update.donation[input.name] = input.value

    if (!update.donation['billing.address.country']) {
      update.donation['billing.address.country'] = config.countryDefault
    }
    if (input.name === 'billing.address.country') {
      delete update.donation['billing.address.state']
    }

    setState(update)
  }

  // Donate click.
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

  // Build options.
  const optionsMonth = () => {
    const options = [<option key={'expMM00'}></option>]
    for (let i = 1; i <= 12; i++) {
      const value = i.toString().padStart(2, '0')
      options.push(<option key={'expMM' + value} value={value}>{value}</option>)
    }

    return options
  }

  const optionsYear = () => {
    const start = parseInt(new Date().toLocaleDateString('en-us', { year:'numeric' })),
          options = [<option key={'expYY00'}></option>]
    for (let i = start; i <= (start + 10); i++) {
      const value = i.toString().padStart(2, '0')
      options.push(<option key={'expYY' + value} value={value}>{value}</option>)
    }

    return options
  }

  // Set display amount and disabled state.
  const heading = t(`headingPayment${method === 'card' ? 'Card' : 'Paypal'}`),
        amount = fee ? state['meta'].amountWithFee : state['meta'].amount,
        disabled = !state['donation'].level_id || !state['meta'].amount || !state['meta'].method

  // Render.
  return (
    <>
      <section data-section="payment" className="-inline">
        <label className="-label">{t('labelPayment')}</label>
        <FormRadio props={{ id: 'card', label: t('optCard'), callback: handleChangeMethod, name: 'method', value: 'card', checked: (method === 'card') }} />
        <FormRadio props={{ id: 'paypal', label: t('optPaypal'), callback: handleChangeMethod, name: 'method', value: 'paypal', checked: (method === 'paypal') }} />
      </section>

      <fieldset data-section="payment" data-toggle={disabled} className="-border">
        <legend>{heading}</legend>
        <FormText props={{ id: 'donor.email', label: t('labelEmail'), callback: handleChangeBilling, type: 'email', className: '-label-s' }} />
        <FormAddress props={{ prefix: 'billing', callback: handleChangeBilling }} />

        <section data-section="card" data-toggle={method !== 'card'}>
          <div className="-inline">
            <FormText props={{ id: 'card_number', label: t('labelCard'), callback: handleChangeBilling, className: '-cc-number', maxlength: 25 }} />
            <FormText props={{ id: 'card_cvv', label: t('labelCVV'), callback: handleChangeBilling, className: '-cc-cvv', maxlength: 4 }} />
          </div>
          <div className="-inline -expiration">
            <FormSelect props={{ id: 'card_exp_date_month', label: t('labelExpMonth'), callback: handleChangeBilling, options: optionsMonth() }} />
            <FormSelect props={{ id: 'card_exp_date_year', label: t('labelExpYear'), callback: handleChangeBilling, options: optionsYear(), className: '-offset-label' }} />
          </div>
        </section>
      </fieldset>

      <section data-section="cookie" data-toggle={disabled}>
        <FormCheckbox props={{ id: 'cookie', label: t('labelCookie'), callback: handleChangeCookie, checked: cookie }} />
      </section>

      <section data-section="fee" data-toggle={disabled}>
        <FormCheckbox props={{ id: 'fee', callback: handleChangeFee, checked: fee, label: t('labelPaymentFee', {
            'organization': t('organization'),
            'amount': formatCurrency(getProcessingFee(state['meta'].amount))
          }) }} />
      </section>

      <section data-section="action" data-toggle={disabled}>
        <div className="input">
          <button onClick={handleClick} disabled={disabled} className={!disabled ? '-active' : ''}>
            {t('labelPaymentButton', { 'amount': formatCurrency(amount)})}
          </button>
        </div>
      </section>
    </>
  )
}
