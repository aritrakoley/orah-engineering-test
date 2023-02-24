import React, { useReducer, createContext, Dispatch } from "react"
import { Person } from "shared/models/person"
import { RolllStateType } from "shared/models/roll"
import { SortOptionsType, FilterOptionsType } from "./utils"

const initialState: StateType = {
  studentList: [],
  isRollMode: false,
  sortOptions: {
    asc: true,
    byFirstName: true,
  },
  filterOptions: {
    name: "",
    rollState: "",
  },
}

type StateType = {
  studentList: Person[]
  isRollMode: boolean
  sortOptions: SortOptionsType
  filterOptions: FilterOptionsType
}

type ContextType = {
  state: StateType
  dispatch: Dispatch<{ type: string; payload: any }>
}

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
        isRollMode: payload,
      }

    case "mark":
      console.log("mark")
      const newList = state.studentList.map((s: Person) => (s.id === payload.id ? { ...s, rollState: payload.rollState } : s))
      return {
        ...state,
        studentList: newList,
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
