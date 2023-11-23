export class TaskValidationError extends Error {
  constructor(message: string, data?: any) {
    const msg = data ? `${message} ${JSON.stringify(data)}` : message
    super(msg)
    this.name = 'TaskValidationError'
  }
}

export class TaskClientConnectionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TaskClientConnectionError'
  }
}
