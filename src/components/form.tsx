
import { ReactElement, useContext } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { Context } from '@/components/context'
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
      <h1 dangerouslySetInnerHTML={{ __html: t('labelHeadline', { 'organization': t('organization')}) }}></h1>
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

export function FormText({ props }): ReactElement {
  return (
    <div className={'input -text' + (props.className ? ' ' + props.className : '')}>
      <label htmlFor={props.id}>{props.label}</label>
      <input onInput={props.callback} name={props.id} id={props.id} type="text" />
    </div>
  )
}

export function FormCheckbox({ props }): ReactElement {
  return (
    <div className={'input -checkbox' + (props.className ? ' ' + props.className : '')}>
      <label htmlFor={props.id}>{props.label}
        <input onChange={props.callback} name={props.id} id={props.id} type="checkbox" checked={props.checked} />
        <span />
      </label>
    </div>
  )
}

export function FormRadio({ props }): ReactElement {
  return (
    <div className={'input -radio' + (props.className ? ' ' + props.className : '')}>
      <label htmlFor={props.id}>{props.label}
        <input onChange={props.callback} name={props.name} id={props.id} type="radio" checked={props.checked} value={props.value} />
        <span />
      </label>
    </div>
  )
}

export function FormSelect({ props }): ReactElement {
  return (
    <div className={'input -select' + (props.className ? ' ' + props.className : '')}>
      <label htmlFor={props.id}>{props.label}</label>
      <select onChange={props.callback} id={props.id} name={props.id}>
        {props.options}
      </select>
    </div>
  )
}

export function FormAddress({ props }): ReactElement {

  const { t } = useTranslation('common')

  const getName = () => {
    if (props.nameCount === 1) {
      return (
        <>
          <FormText props={{ id: props.prefix + '.name.full', label: t('labelName'), callback: props.callback }} />
        </>
      )
    } else {
      return (
        <>
          <FormText props={{ id: props.prefix + '.name.first', label: t('labelFname'), callback: props.callback }} />
          <FormText props={{ id: props.prefix + '.name.last', label: t('labelLname'), callback: props.callback }} />
        </>
      )
    }
  }

  return (
    <>
      <div className="-inline">
        {getName()}
      </div>
      <div className="-inline">
        <FormText props={{ id: props.prefix + '.address.street1', label: t('labelAddr1'), callback: props.callback }} />
        <FormText props={{ id: props.prefix + '.address.street2', label: t('labelAddr2'), callback: props.callback }} />
      </div>
      <div className="-inline">
        <FormText props={{ id: props.prefix + '.address.city', label: t('labelAddrCity'), callback: props.callback }} />
        <FormSelect props={{ id: props.prefix + '.address.state', label: t('labelAddrState'), callback: props.callback, options: [

          ] }} />
      </div>
      <div className="-inline">
        <FormText props={{ id: props.prefix + '.address.zip', label: t('labelAddrZip'), callback: props.callback }} />
        <FormSelect props={{ id: props.prefix + '.address.country', label: t('labelAddrCountry'), callback: props.callback, options: [

          ] }} />
      </div>
    </>
  )
}