
import { FormEvent, ReactElement, useContext } from 'react'
import { roundCurrency, formatCurrency, getProcessingFee } from '@/lib/utility'
import Context from '@/components/context'

/**
 * Get level from updated state.meta.levels based on previous amount.
 */
export const getLevelByAmount = (state: object): object|boolean => {
  let levels = state['meta'].levels,
      level

  if (levels && state['meta'].amount) {
    for (let i = 0; i < levels.length; i++) {
      if (levels[i].amount === state['meta'].amount) {
        level = levels[i]
      } else if (levels[i].userSpecified === true && state['donation'].other_amount) {
        level = levels[i]
      }
    }

    return level
  }

  return false
}

export function Levels(): ReactElement {

  // @ts-ignore
  const { state, setState, getStateUpdate } = useContext(Context)

  let inputCustom

  // Level input event.
  const handleChangeLevel = async (e: FormEvent) => {

    const input = e.target as HTMLFormElement,
          isButton = (input.tagName === 'BUTTON'),
          levelId = parseInt(input.getAttribute('data-level'))

    let amount = (isButton ? input.getAttribute('data-amount') : input.value.replace(/[^\d.-]/g, ''))
        amount = roundCurrency(parseFloat(amount))

    const update = getStateUpdate()
    update.donation.level_id  = levelId
    update.meta.amount        = amount
    update.meta.amountWithFee = amount + getProcessingFee(amount)

    if (isButton) {
      e.preventDefault()
      delete update.donation.other_amount
      inputCustom.value = ''
    } else {
      update.donation.other_amount = amount
    }

    setState(update)
  }

  // Render.
  const levels = state['meta'].levels

  if (levels) {
    let inputs = [],
        userSpecified = null

    for (let i = 0; i < levels.length; i++) {
      const value = levels[i].level_id,
            amount = levels[i].amount,
            amountFormatted = formatCurrency(amount),
            custom = levels[i].userSpecified,
            className = (value === state['donation'].level_id ? '-active' : ''),
            input = <div key={value} className="input">
                      <button data-level={value} data-amount={levels[i].amount} onClick={handleChangeLevel} className={className}>{amountFormatted}</button>
                    </div>

      if (!custom) {
        inputs.push(input)
      } else {
        userSpecified =
          <div key={value} className="input -custom-level">
            <label htmlFor={value} className="sr-only">Other amount</label>
            <input type="text" maxLength={5}
              id={value} data-level={value} data-amount={amount} onInput={handleChangeLevel} className={className} ref={input => { inputCustom = input}}
              placeholder={state['donation'].other_amount ? formatCurrency(state['donation'].other_amount - (state['meta'].fee ? getProcessingFee(state['donation'].other_amount) : 0)).replace('$', '') : 'Other amount'} />
          </div>
      }
    }

    if (userSpecified) {
      inputs.push(userSpecified)
    }

    return (
      <section data-section="levels">
        {inputs}
      </section>
    )
  }

  return  (<></>)

}
