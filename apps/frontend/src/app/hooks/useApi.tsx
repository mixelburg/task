import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { atom, useSetAtom } from 'jotai'
import { useRef, useState } from 'react'
import { AxiosError } from 'axios'

export const fromAtom = atom<string>('')

type OnBadRequest = () => Promise<void>

const useAPI = <T, U extends Array<any>>(apiFunc: (...args: U) => Promise<T>, ignoreCodes: number[] = [], onBadRequest: OnBadRequest = async () => undefined): [
  (...args: U) => Promise<T>,
  boolean,
  boolean,
] => {
  const maxRetries = 2
  const navigate = useNavigate()
  const location = useLocation()
  const setFrom = useSetAtom(fromAtom)
  const [retry, setRetry] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const retries = useRef(0)

  const handleResponseStatus = async (status: number, error: AxiosError) => {
    switch (status) {
      case 400:
        toast.error('something went wrong', {
          toastId: 'something-went-wrong',
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: true,
        })
        await onBadRequest()
        break
      case 401:
        toast.error('You shall not pass...', { toastId: 'token-expired' })
        if (location.pathname !== `/login`) {
          setFrom(`${location.pathname}${location.hash}`)
        }
        navigate(`/login`, { replace: true })
        break
      case 403:
        toast.error('you are not authorized to access this page', { toastId: 'not-authorized' })
        navigate('/')
        break
      case 0:
        if (retries.current === maxRetries) {
          toast.warning('check your internet connection', { toastId: 'no-internet' })
        }
        break
      case 503:
      case 429:
        if (retries.current === maxRetries) {
          toast.warning('Our servers are under heavy load Please be patient, the session is loading', {
            toastId: 'heavy-load',
            closeButton: true,
          })
        }
        break
      default:
        if (retries.current === maxRetries) {
          toast.error('something went wrong', {
            toastId: 'something-went-wrong',
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: true,
          })
        }
    }
  }


  const func = async (...args: U) => {
    setRetry(false)
    try {
      setLoading(true)
      return await apiFunc(...args)
    } catch (e: any) {
      let error: AxiosError = e
      let status = error.code === 'ERR_NETWORK' ? 0 : error.response?.status as number
      console.error('Error', status, error)

      if (!ignoreCodes.includes(status)) {
        if (status === 429 || `${status}`.startsWith('5') || status === 0) {
          setRetry(true)

          // eslint-disable-next-line no-constant-condition
          while (true) {
            retries.current += 1
            const delay = status !== 429 ? retries.current * 1750 : 4000

            await new Promise((resolve) => setTimeout(resolve, delay))
            try {
              return await apiFunc(...args)
            } catch (re: any) {
              error = re
              status = e.code === 'ERR_NETWORK' ? 0 : error.response?.status as number

              if (!ignoreCodes.includes(status)) {
                await handleResponseStatus(status, error)

                if (status !== 429 && retries.current >= maxRetries) {
                  retries.current = 0
                  break
                }
              }
            }
          }
        }

        await handleResponseStatus(status, error)
      }
      throw e
    } finally {
      setLoading(false)
    }
  }

  return [func, loading, retry]
}

export default useAPI
