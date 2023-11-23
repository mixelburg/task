import { AxiosResponseTransformer } from 'axios'

function dateReviver(key: any, value: any) {
  // This regex matches date strings in the format: YYYY-MM-DDTHH:mm:ss.sssZ
  const datePattern = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d*)?Z)$/

  if (typeof value === 'string' && datePattern.test(value)) {
    return new Date(value)
  }

  return value
}

export const transformResponse: AxiosResponseTransformer = (data: any) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data, dateReviver)
    } catch (e) {
      return data
    }
  }
  return data
}
