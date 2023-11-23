import axios, { AxiosRequestConfig, AxiosResponseTransformer } from 'axios'
import { joinUrl } from '@tasks/util'
import { TaskApiClient } from '@tasks/client'
import { HealthCheckResponse, ILoginData, UserDetails } from '@tasks/types'

const baseUrl = joinUrl(import.meta.env.VITE_API_URL || 'https://localhost:3001', 'api')

function dateReviver(key: any, value: any) {
  // This regex matches date strings in the format: YYYY-MM-DDTHH:mm:ss.sssZ
  const datePattern = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d*)?Z)$/

  if (typeof value === 'string' && datePattern.test(value)) {
    return new Date(value)
  }

  return value
}

const transformResponse: AxiosResponseTransformer = (data: any) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data, dateReviver)
    } catch (e) {
      return data
    }
  }
  return data
}

const axiosConfig: AxiosRequestConfig = {
  baseURL: baseUrl,
  withCredentials: true,
  transformResponse,
}
const axiosInstance = axios.create(axiosConfig)


const managerClient = new TaskApiClient(
  null,
  joinUrl(baseUrl, 'manager'),
)

const apiService = {
  auth: {
    checkLogin: async (): Promise<UserDetails> => (await axiosInstance.get('auth/details')).data,
    login: async (data: ILoginData): Promise<string> => await axiosInstance.post('auth/login', data),
    logout: async (): Promise<string> => await axiosInstance.post('auth/logout'),
  },
  health: async (): Promise<HealthCheckResponse> => (await axiosInstance.get('health')).data,
  manager: managerClient,
}

export default apiService
