import type { Category, Tag } from "~/server/utils/drizzle"

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

export interface DonutChart {
  key: String
  value: Number
  icon: String
  symbol: String
}

export interface ExpensesBy {
  rows: Category[] | Tag[]
  charts: DonutChart[]
}

export interface Query {
    groupId: LocationQuery
    tagIds: Array<Number>
    boardIds: Array<Number>
    categoryIds: Array<Number>
    sort: String
    order: String
}
export interface Column {
    key: String
    label: String
    sortable?: Boolean
}
export interface Sort {
    column: String
    direction: String
}

export interface CurrencySyncApi {
  ts: number
  base: string
  quotes: Object
}
export interface SymbolLocalJson {
  flag: string
  country: string
  currency: string
  iso_code: string
  symbol: string
  hex_symbol: string
}
export interface PatchCurrency {
  isoCode: string
  rate: number
}