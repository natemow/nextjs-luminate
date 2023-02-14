
import queryString from 'query-string'
import { createContext, useState, useEffect } from 'react'
import { API, Forms, getProcessingFee } from '@/lib/utility'
import { getLevelByAmount } from '@/components/levels'

const Context = createContext([])
export default Context

export function ContextProvider({ children }) {

  const [loading, setLoading] = useState(true)

  const [state, setState] = useState({
    donation: {
      form_id: Forms.once.standard,
      level_id: null,
      remember_me: false
    },
    meta: {
      debug: false,
      frequency: 'once',
      levels: [],
      method: 'card',
      fee: false,
      amount: 0,
      amountWithFee: 0
    }
  })

  /**
   * Get donation levels from the API and update state.
   */
  const setLevels = () => {
    if (loading) {
      let levelId, amount

      API.getDonationLevels(state['donation'].form_id)
        .then(levels => {

          const update = getStateUpdate()
          update.meta.levels = levels

          const level = getLevelByAmount(update)
          if (level !== false) {
            // Matched new level by existing amount.
            levelId = level['level_id']
            amount = level['amount']
          } else {
            // Default to 2nd button's level.
            levelId = levels[2].level_id
            amount = levels[2].amount
          }

          update.donation.level_id  = levelId
          update.meta.amount        = amount
          update.meta.amountWithFee = amount + getProcessingFee(amount)

          setLoading(false)
          setState(update)
        })
    }
  }

  /**
   * Get an object suitable for updating and sending to setState().
   *
   * Replace in state, don't mutate!!
   * @see https://beta.reactjs.org/reference/react/useState#ive-updated-the-state-but-the-screen-doesnt-update
   */
  const getStateUpdate = () => {
    return {
      ...state,
      donation: {
        ...state['donation']
      },
      meta: {
        ...state['meta']
      }
    }
  }

  useEffect(() => {
    const query = queryString.parse(window.location.search)

    if (query.debug) {

      const update = getStateUpdate()
      update.meta.debug = true

      setState(update)
    }

  }, [state, setState])

  return (
    // @ts-ignore
    <Context.Provider value={{ state, setState, getStateUpdate, setLevels, loading, setLoading }}>
      {children}
    </Context.Provider>
  )
}