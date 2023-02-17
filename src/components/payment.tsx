
import { FormEvent, ReactElement, useContext, useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { API, formatCurrency, getProcessingFee } from '@/lib/utility';
import Context from '@/components/context'
import { FormText, FormCheckbox, FormRadio, FormSelect } from '@/components/form'

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


  // Set display amount and disabled state.
  const heading = t(`headingPayment${method === 'card' ? 'Card' : 'Paypal'}`),
        amount = fee ? state['meta'].amountWithFee : state['meta'].amount,
        disabled = !state['donation'].level_id || !state['meta'].amount || !state['meta'].method

  // Render.
  return (
    <>
      <section data-section="payment" className="-inline">
        <label className="-label">{t('labelPayment')}</label>
        <FormRadio id="card" label={t('optCard')} callback={handleChangeMethod} checked={method === 'card'} name="method" value="card" />
        <FormRadio id="paypal" label={t('optPaypal')} callback={handleChangeMethod} checked={method === 'paypal'} name="method" value="paypal" />
      </section>

      <fieldset data-section="payment" data-toggle={ disabled } className="-border">
        <legend>{heading}</legend>
        <div className="-inline">
          <FormText id="billing.name.first" label={t('labelFname')} callback={() => {}} />
          <FormText id="billing.name.last" label={t('labelLname')} callback={() => {}} />
        </div>
        <div className="-inline">
          <FormText id="billing.address.street1" label={t('labelAddr1')} callback={() => {}} />
          <FormText id="billing.address.street2" label={t('labelAddr2')} callback={() => {}} />
        </div>
        <div className="-inline">
          <FormText id="billing.address.city" label={t('labelAddrCity')} callback={() => {}} />
          <FormSelect id="billing.address.state" label={t('labelAddrState')} callback={() => {}} options={[]} />
        </div>
        <div className="-inline">
          <FormText id="billing.address.zip" label={t('labelAddrZip')} callback={() => {}} />
          <FormSelect id="billing.address.country" label={t('labelAddrCountry')} callback={() => {}} options={[]} />
        </div>
      </fieldset>

      <section data-section="cookie" data-toggle={disabled}>
        <FormCheckbox id="cookie" label={t('labelCookie')} callback={handleChangeCookie} checked={cookie} />
      </section>

      <section data-section="fee" data-toggle={disabled}>
        <FormCheckbox id="fee" callback={handleChangeFee} checked={fee} label={t('labelPaymentFee', {
          'organization': t('organization'),
          'amount': formatCurrency(getProcessingFee(state['meta'].amount))
        })} />
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
