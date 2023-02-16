
import { ReactElement, useContext } from 'react'
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
