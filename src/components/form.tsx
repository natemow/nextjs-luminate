
import {FormEventHandler, ReactElement, useContext} from 'react'
import useTranslation from 'next-translate/useTranslation'
import Context from '@/components/context'
import { Locale } from '@/components/locale'
import { Frequency } from '@/components/frequency'
import { Levels } from '@/components/levels'
import { Tribute } from '@/components/tribute'
import { Payment } from '@/components/payment'

export function Form(): ReactElement {

  const { t } = useTranslation('common')

  // @ts-ignore
  const { state } = useContext(Context)

  const getDebug = () => {
    if (state['meta'].debug) {
      return (<pre>{JSON.stringify(state, null, 2)}</pre>)
    } else {
      return (<></>)
    }
  }

  return (
    <form className="donation">
      <Locale />
      <Frequency />
      <Levels />
      <Tribute />
      <Payment />

      <p className="help" dangerouslySetInnerHTML={{ __html: t('helpInfo') }}></p>

      {getDebug()}
    </form>
  )
}

export function FormText({ id, label, callback }): ReactElement {
  return (
    <div className="input -text">
      <label htmlFor={id}>{label}</label>
      <input onInput={callback} name={id} id={id} type="text" />
    </div>
  )
}

export function FormCheckbox({ id, label, callback, checked }): ReactElement {
  return (
    <div className="input -checkbox">
      <label htmlFor={id}>{label}
        <input onChange={callback} name={id} id={id} type="checkbox" checked={checked} />
        <span />
      </label>
    </div>
  )
}

export function FormRadio({ id, label, callback, checked, name, value }): ReactElement {
  return (
    <div className="input -radio">
      <label htmlFor={id}>{label}
        <input onChange={callback} name={name} id={id} type="radio" checked={checked} value={value} />
        <span />
      </label>
    </div>
  )
}

export function FormSelect({ id, label, callback, options }): ReactElement {
  return (
    <div className="input -select">
      <label htmlFor={id}>{label}</label>
      <select onChange={callback} id={id} name={id}>
        {options}
      </select>
    </div>
  )
}
