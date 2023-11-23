import { defaultGuard } from '@tasks/types'
import { GridFilterModel, GridSortModel } from '@mui/x-data-grid-pro'


const fieldsToConvertToDate = ['createdAt', 'updatedAt', 'finishedAt', 'initiatedAt', 'startedAt']
const fieldsToConvertToNumber = [
  'retry',
  'progress',
]

const convertToDate = (value: string | string[]): any =>
  Array.isArray(value) ? value.map((v) => convertToDate(v)) : new Date(value)

const convertToNumber = (value: string | string[]): any =>
  (Array.isArray(value) ? value.map((v) => convertToDate(v)) : new Date(value)) as any

const formatField = (field: string) => field === 'id' ? '_id' : field

export const filterModelToPrismaWhere = (filterModel: GridFilterModel) => {
  return filterModel.items && filterModel.logicOperator
    ? {
      [filterModel.logicOperator.toUpperCase()]: filterModel.items.map(
        (item) => ({
          [item.field]: formatFilterEntryPrisma(
            item.operator as Operator,
            fieldsToConvertToDate.includes(item.field)
              ? new Date(item.value || 0)
              : fieldsToConvertToNumber.includes(item.field)
                ? parseInt(item.value)
                : item.value,
          ),
        }),
      ),
    }
    : undefined
}

export const filterModelToMongoWhere = (filterModel: GridFilterModel) => {
  const logicOperatorValue = filterModel?.items.map(
    (item) => ({
      [formatField(item.field)]: formatFilterEntryMongo(
        item.field,
        item.operator as Operator,
        fieldsToConvertToDate.includes(item.field)
          ? convertToDate(item.value || 0)
          : fieldsToConvertToNumber.includes(item.field)
            ? convertToNumber(item.value)
            : item.value,
      ),
    }),
  )

  return filterModel.items && filterModel.logicOperator && logicOperatorValue?.length > 0
    ? {
      [`$${filterModel.logicOperator}`]: logicOperatorValue,
    }
    : undefined
}

type Operator =
  | 'contains'
  | 'equals'
  | 'is'
  | 'startsWith'
  | 'endsWith'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'isAnyOf'
  | 'not'
  | '='
  | '>'
  | '>='
  | '<'
  | '<='
  | '!='
  | 'after'
  | 'onOrAfter'
  | 'before'
  | 'onOrBefore'

export const formatFilterEntryMongo = (field: string, operator: Operator, value: any) => {
  if (field === 'id') {
    switch (operator) {
      case 'equals':
      case '=':
      case 'is':
        return { $oid: value }
      case 'isAnyOf':
        return { $in: (value || []).map((v: any) => ({ $oid: v })) }
      case '!=':
      case 'not':
        return { $ne: { $oid: value } }
    }
    return
  }

  switch (operator) {
    case 'contains':
      return { $regex: value }
    case 'equals':
    case '=':
    case 'is':
      return value
    case 'startsWith':
      return { $regex: `^${value}` }
    case 'endsWith':
      return { $regex: `${value}$` }
    case 'isEmpty':
      return { $exists: false }
    case 'isNotEmpty':
      return { $exists: true }
    case 'isAnyOf':
      return { $in: value || [] }
    case '!=':
    case 'not':
      return { $ne: value }
    case '>':
    case 'after':
      return { $gt: value }
    case '>=':
    case 'onOrAfter':
      return { $gte: value }
    case '<':
    case 'before':
      return { $lt: value }
    case '<=':
    case 'onOrBefore':
      return { $lte: value }
    default:
      return defaultGuard(operator)
  }
}

export const formatFilterEntryPrisma = (operator: Operator, value: any) => {
  switch (operator) {
    case 'contains':
      return { contains: value }
    case 'equals':
    case 'is':
    case '=':
      return value
    case 'startsWith':
      return { $like: `${value}%` }
    case 'endsWith':
      return { $like: `%${value}` }
    case 'isEmpty':
      return { isSet: false }
    case 'isNotEmpty':
      return { not: { equals: '' } }
    case 'isAnyOf':
      return { in: value || [] }
    case '!=':
    case 'not':
      return { not: { equals: value } }
    case '>':
    case 'after':
      return { gt: value }
    case '>=':
    case 'onOrAfter':
      return { gte: value }
    case '<':
    case 'before':
      return { lt: value }
    case '<=':
    case 'onOrBefore':
      return { lte: value }
    default:
      return defaultGuard(operator)
  }
}

export const sortToMongoSort = (sortModel: GridSortModel) => {
  const sort: any = {}
  for (const sortItem of sortModel) {
    sort[sortItem.field] = sortItem.sort === 'asc' ? 1 : -1
  }
  return sort
}

export const sortToPrismaSort = (sortModel: GridSortModel) => sortModel.map((sortItem) => ({
  [sortItem.field]: sortItem.sort,
}))
