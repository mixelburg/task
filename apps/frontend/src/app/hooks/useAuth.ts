import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useAtomValue, useSetAtom } from 'jotai'
import { userDetailsAtom } from '../atoms/userDetailsAtom'
import { backendHealthAtom } from '../atoms/atoms'
import useApi, { fromAtom } from './useApi'
import api from '../services/api'

type Context = 'authorized' | 'unauthorized'

const getIgnoreCodes = (context: Context) => (context === 'unauthorized' ? [401] : [])

const useAuth = (context: Context) => {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const setUserDetails = useSetAtom(userDetailsAtom)
  const setHealth = useSetAtom(backendHealthAtom)
  const from = useAtomValue(fromAtom)

  const [getHealth] = useApi(api.health, getIgnoreCodes(context))
  const [getUserDetails] = useApi(api.auth.checkLogin, getIgnoreCodes(context))

  const checkLogin = async () => {
    setLoading(true)
    // check if the token is valid
    // if it is not valid, api with throw unauthorized error
    try {
      const [apiHealth, userDetails] = await Promise.all([getHealth(), getUserDetails()])
      setUserDetails(userDetails)
      setHealth(apiHealth)

      if (context !== 'authorized') {
        toast.success('Welcome back! 1', { toastId: 'welcome-back' })
        if (from) {
          navigate(from, { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }
    } catch (e: any) {
      console.error('api error', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkLogin().then()
  }, [])
  return {
    loading,
    reload: checkLogin,
  }
}

export default useAuth
