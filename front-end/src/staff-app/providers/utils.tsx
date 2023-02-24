import { Person } from "shared/models/person"
import { RollInput, RolllStateType } from "shared/models/roll"

export type SortOptionsType = {
  asc: boolean
  byFirstName: boolean
}

export type FilterOptionsType = {
  name: string
  rollState: string
}

export interface StateList {
  type: ItemType
  count: number
}

export type ItemType = RolllStateType | "all"

const sortStudents = (list: Person[], sortOptions: SortOptionsType) => {
  const { asc, byFirstName } = sortOptions

  const studentCompare = (a: any, b: any) => {
    const _a = byFirstName ? a.first_name : a.last_name
    const _b = byFirstName ? b.first_name : b.last_name

    const res = _a.localeCompare(_b)
    return asc ? res : -res
  }

  list.sort(studentCompare)
  return [...list]
}

export const filterStudents = (list: Person[], filterOptions: FilterOptionsType) => {
  const { name, rollState } = filterOptions
  return list.filter(
    (e) => `${e.first_name} ${e.last_name}`.toLowerCase().includes(name.toLowerCase()) && (!rollState || rollState.toString() === "all" || e.rollState === rollState)
  )
}

export const getListToDisplay = (list: Person[], sortOptions: SortOptionsType, filterOptions: FilterOptionsType) => {
  return sortStudents(filterStudents(list, filterOptions), sortOptions)
}

export const getRollSummary = (list: Person[]) => {
  const summary = [
    { type: "all", count: list.length },
    { type: "present", count: 0 },
    { type: "late", count: 0 },
    { type: "absent", count: 0 },
  ]

  for (const s of list) {
    switch (s.rollState) {
      case "present":
        summary[1].count++
        break
      case "late":
        summary[2].count++
        break
      case "absent":
        summary[3].count++
        break
    }
  }
  return summary as StateList[]
}

export const markAttendance = (list: Person[], roll: any[]) => {
  // return list
  const rollMap = new Map()
  for (const s of roll) rollMap.set(s.student_id, s.roll_state)
  console.log(rollMap)

  return list.map((s) => ({ ...s, rollState: rollMap.get(s.id) }))
}

export const toTitleCase = (s: string) => s[0].toUpperCase() + s.slice(1)
