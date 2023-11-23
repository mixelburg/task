export type HealthModuleResult = {
  ok: boolean
}

export type HealthCheckResponse = {
  version: string
  database: HealthModuleResult
}

