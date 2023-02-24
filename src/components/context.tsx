
import queryString from 'query-string'
import { createContext, useState, useEffect } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { API, Forms, clearInput, getProcessingFee } from '@/lib/utility'
import { getLevelByAmount } from '@/components/levels'

export const Context = createContext([])

export function ContextProvider({ children }) {

  const { lang } = useTranslation('common'),
        [ loading, setLoading ] = useState(true)

  const [ state, setState ] = useState({
    donation: {
      form_id: Forms.once.standard,
      level_id: null,
      remember_me: true,
      'donor.email_opt_in': true
    },
    meta: {
      debug: false,
      locale: lang,
      frequency: 'once',
      levels: [],
      notify: '',
      fee: false,
      amount: 0,
      amountWithFee: 0
    }
  })

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

  /**
   * Helper function to prune data from update.donation.
   */
  const pruneState = (update: object, prefix: string) => {
    // @ts-ignore
    Object.keys(update.donation).forEach(key => {
      if (key.indexOf(prefix) === 0) {
        // @ts-ignore
        delete update.donation[key]
        clearInput(key)
      }
    });
  }

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

  useEffect(() => {
    const query = queryString.parse(window.location.search)

    if (query.debug) {
      state['meta'].debug = true
      setState(state)
    }

  }, [state, setState])

  return (
    // @ts-ignore
    <Context.Provider value={{ state, setState, getStateUpdate, pruneState, loading, setLoading, setLevels }}>
      {children}
    </Context.Provider>
  )
}
