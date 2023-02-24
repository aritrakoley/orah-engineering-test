import React, { useReducer, createContext, Dispatch } from "react"
import { Person } from "shared/models/person"
import { RolllStateType } from "shared/models/roll"
import { SortOptionsType, FilterOptionsType } from "./utils"

const initialState: StateType = {
  studentList: [],
  sortOptions: {
    asc: true,
    byFirstName: true,
  },
  filterOptions: {
    name: "",
    rollState: "",
  },
  rollOptions: {
    isRollMode: false,
    rollMap: new Map(),
  },
}

type RollOptionsType = {
  isRollMode: boolean
  rollMap: Map<number, RolllStateType>
}

type StateType = {
  studentList: Person[]
  sortOptions: SortOptionsType
  filterOptions: FilterOptionsType
  rollOptions: RollOptionsType
}

type ContextType = {
  state: StateType
  dispatch: Dispatch<{ type: string; payload: any }>
}

// Helpers -----------------
// const sortStudents = (list: any[], sortOptions: SortOptionsType) => {
//   const { asc, byFirstName } = sortOptions

//   const studentCompare = (a: any, b: any) => {
//     const _a = byFirstName ? a.first_name : a.last_name
//     const _b = byFirstName ? b.first_name : b.last_name

//     const res = _a.localeCompare(_b)
//     return asc ? res : -res
//   }

//   list.sort(studentCompare)
//   return [...list]
// }

// const filterStudents = (list: any[], filterOptions: FilterOptionsType) => {
//   const { name, rollState } = filterOptions
//   return list.filter(
//     (e) => `${e.first_name} ${e.last_name}`.toLowerCase().includes(name.toLowerCase()) && (!rollState || rollState.toString() === "all" || e.rollState === rollState)
//   )
// }

const markAttendance = (list: any[], rollOptions: RollOptionsType) => {
  const { isRollMode, rollMap } = rollOptions
  if (!isRollMode || !rollMap.size) return list
  return list.map((e) => ({ ...e, rollState: rollMap.get(e.id) }))
}

// const updateList = (list: any[], sortOptions: SortOptionsType, filterOptions: FilterOptionsType, rollOptions: RollOptionsType) => {
//   return filterStudents(markAttendance(sortStudents(list, sortOptions), rollOptions), filterOptions)
// }
//--------------------------

export const RollContext = createContext<ContextType>({ state: initialState, dispatch: () => {} })

const reducer = (state: any, action: { type: string; payload: any }) => {
  const { type, payload } = action
  switch (type) {
    case "update":
      console.log("update")
      return {
        ...state,
        studentList: payload as Person[],
      }

    case "sort":
      console.log("sort")
      return {
        ...state,
        sortOptions: { ...state.sortOptions, ...payload },
      }

    case "search":
      console.log("search")
      return {
        ...state,
        filterOptions: { ...state.filterOptions, ...payload },
      }

    case "roll":
      console.log("roll")
      return {
        ...state,
        rollOptions: { ...state.rollOptions, ...payload },
      }

    case "mark":
      console.log("mark")
      state.rollOptions.rollMap.set(payload.id, payload.rollState)
      // const newList = state.studentList.map((s: any) => (s.id === payload.id ? { ...s, rollState: payload.rollState } : s))
      return {
        ...state,
        // studentList: newList,
      }
    default:
      return { ...state }
  }
}

type Props = {}
export const RollProvider: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <RollContext.Provider value={{ state, dispatch }}>{children}</RollContext.Provider>
}

export default RollProvider
