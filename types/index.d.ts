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