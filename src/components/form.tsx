
import { ReactElement, useContext } from 'react'
import Context from '@/components/context'
import { Frequency } from '@/components/frequency'
import { Levels } from '@/components/levels'
import { Tribute } from '@/components/tribute'
import { Payment } from '@/components/payment'

export function Form(): ReactElement {

  // @ts-ignore
  const { state } = useContext(Context)

  const getDebug = () => {
    // if (state['meta'].debug) {} else { return (<></>) }
    return <pre>{JSON.stringify(state, null, 2)}</pre>
  }

  return (
    <form className="donation">
      <Frequency />
      <Levels />
      <Tribute />
      <Payment />
      {getDebug()}
    </form>
  )
}
