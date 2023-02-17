
import { FormEvent, ReactElement, useContext, useState } from 'react'
import setLanguage from 'next-translate/setLanguage'
import { Context } from '@/components/context'

export function Locale(): ReactElement {

  // @ts-ignore
  const { state, setState, getStateUpdate } = useContext(Context)

  // Tab click.
  let [locale, setLocale] = useState(state['meta'].locale)
  const handleClick = async (e: FormEvent) => {
    e.preventDefault()

    const btn = e.target as HTMLButtonElement

    locale = btn.getAttribute('data-locale')
    setLocale(locale)

    await setLanguage(locale)

    const update = getStateUpdate()
    update.meta.locale = locale

    // Update state.
    setState(update)
  }

  // Button helper.
  const getButton = (value: string, label: string) => {
    return (
      <a data-locale={value} onClick={handleClick} className={locale === value ? '-active' : ''} href={'/' + value}>{label}</a>
    )
  }

  return (
    <nav data-section="locale">
      <ul className="help -inline">
        <li>{getButton('en', 'EN')}</li>
        <li>{getButton('es', 'ES')}</li>
      </ul>
    </nav>
  )
}
