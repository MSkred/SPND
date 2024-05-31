import type { Category } from "~/server/utils/drizzle"

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

export interface ExpensesByCategories {
  rows: Category[]
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