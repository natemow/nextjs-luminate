
import { ReactElement, FormEvent, useContext, useState, useMemo } from 'react'
import useTranslation from 'next-translate/useTranslation'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { config, getStates, getCountries } from '@/lib/utility'
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
      <input onInput={props.callback} name={props.id} defaultValue={props.defaultValue ?? null} id={props.id} type="text" placeholder={props.placeholder ?? null} />
    </div>
  )
}

export function FormTextarea({ props }): ReactElement {
  return (
    <div className={'input -textarea' + (props.className ? ' ' + props.className : '')}>
      <label htmlFor={props.id}>{props.label}</label>
      <textarea onInput={props.callback} name={props.id} defaultValue={props.defaultValue ?? null} id={props.id} placeholder={props.placeholder ?? null} />
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
      <select onChange={props.callback} defaultValue={props.defaultValue ?? null} id={props.id} name={props.id}>
        {props.options}
      </select>
    </div>
  )
}

export function FormAddress({ props }): ReactElement {

  const { t } = useTranslation('common')

  // @ts-ignore
  const { state } = useContext(Context)

  // Toggle full or first/last name fields.
  const getName = () => {
    if (props.nameCount === 1) {
      return <FormText props={{ id: props.prefix + '.name.full', label: t('labelName'), callback: props.callback }} />
    } else {
      return (<>
        <FormText props={{ id: props.prefix + '.name.first', label: t('labelFname'), callback: props.callback }} />
        <FormText props={{ id: props.prefix + '.name.last', label: t('labelLname'), callback: props.callback }} />
      </>)
    }
  }

  // Province change.
  const [province, setProvince] = useState(state['donation'][props.prefix + '.address.state'])

  // Country change.
  const [country, setCountry] = useState(state['donation'][props.prefix + '.address.country'] ?? config.defaultCountry)
  const handleChangeCountry = async (e: FormEvent) => {

    const input = e.target as HTMLFormElement

    setCountry(input.value)
    setProvince(null)
    props.callback(e)
  }

  // Build options.
  const getOptions = (data) => {
    const options = [<option key="" value="">{t('optEmpty')}</option>]
    for (let i = 0; i < data.length; i++) {
      options.push(<option key={data[i].isoCode} value={data[i].isoCode}>{data[i].name}</option>)
    }
    return options
  }

  const optionsState = useMemo(() => {
    return getOptions(getStates(country))
  }, [country])

  const optionsCountry = useMemo(() => {
    return getOptions(getCountries())
  }, [])

  return (
    <>
      <div className="-inline">
        {getName()}
      </div>
      <div className="-inline">
        <FormText props={{ id: props.prefix + '.address.street1', label: t('labelAddr1'), callback: props.callback }} />
        <FormText props={{ id: props.prefix + '.address.street2', label: t('labelAddr2'), callback: props.callback, className: '-offset-label' }} />
      </div>
      <div className="-inline">
        <FormText props={{ id: props.prefix + '.address.city', label: t('labelAddrCity'), callback: props.callback }} />
        <FormSelect props={{ id: props.prefix + '.address.state', label: t('labelAddrState'), callback: props.callback, options: optionsState, defaultValue: province }} />
      </div>
      <div className="-inline">
        <FormText props={{ id: props.prefix + '.address.zip', label: t('labelAddrZip'), callback: props.callback }} />
        <FormSelect props={{ id: props.prefix + '.address.country', label: t('labelAddrCountry'), callback: handleChangeCountry, options: optionsCountry, defaultValue: country }} />
      </div>
    </>
  )
}

export function FormDate({ props }): ReactElement {

  const { lang } = useTranslation('common')

  // @ts-ignore
  const { state } = useContext(Context)

  const [date, setDate] = useState(state['donation'][props.id] ?? null)
  const handleChangeDate = async (date) => {
    setDate(date)
    props.callback(props, date)
  }

  return (
    <div className={'input -text' + (props.className ? ' ' + props.className : '')}>
      <label htmlFor={props.id}>{props.label}</label>
      <DatePicker locale={lang} selected={date} onChange={handleChangeDate} />
    </div>
  )
}
