
import { FormEvent, ReactElement, useContext, useState, useEffect } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { Forms } from '@/lib/utility'
import Context from '@/components/context'

export function Frequency(): ReactElement {

  const { t } = useTranslation('common')

  // @ts-ignore
  const { state, setState, getStateUpdate, setLevels, setLoading } = useContext(Context)

  // Tab click.
  let [frequency, setFrequency] = useState(state['meta'].frequency)
  const handleClick = async (e: FormEvent) => {
    e.preventDefault()

    const btn = e.target as HTMLButtonElement

    frequency = btn.getAttribute('data-frequency')
    setFrequency(frequency)

    const update = getStateUpdate()
    update.donation.form_id   = Forms[frequency].standard
    update.donation.level_id  = null
    update.meta.frequency     = frequency
    update.meta.amount        = 0
    update.meta.amountWithFee = 0

    if (frequency === 'sustain') {
      update.donation['sustaining.frequency'] = 'monthly'
      update.donation['sustaining.duration']  = 0
    } else {
      delete update.donation['sustaining.frequency']
      delete update.donation['sustaining.duration']
    }

    // Make sure Context.setLevels() can run.
    setLoading(true)

    // Update state.
    setState(update)
  }

  // Button helper.
  const getButton = (value: string, label: string) => {
    return (
      <button data-frequency={value} onClick={handleClick} className={frequency === value ? '-active' : ''}>{label}</button>
    )
  }

  useEffect(() => {
    setLevels()
  }, [setLevels])

  // Render.
  return (
    <>
      <nav data-section="frequency">
        <ul className="-inline">
          <li className="input">{getButton('once', t('frequencyOnce'))}</li>
          <li className="input">{getButton('sustain', t('frequencySustain'))}</li>
        </ul>
      </nav>
    </>
  )
}
