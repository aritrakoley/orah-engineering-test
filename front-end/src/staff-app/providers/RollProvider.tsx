import React, { useContext, useReducer, createContext, Dispatch, SetStateAction } from "react"

const initialState = {
  studentList: [],
  isRollMode: false,
  sortOptions: {
    asc: true,
    byFirstName: true,
  },
  filterOptions: {
    name: "",
    attendance: "",
  },
}

type ContextType = {
  state: any
  dispatch: Dispatch<{ type: string; payload: any }>
}
export const RollContext = createContext<ContextType>({ state: initialState, dispatch: () => {} })

const reducer = (state: any, action: { type: string; payload: any }) => {
  const { type, payload } = action
  switch (type) {
    case "data":
      return {
        ...state,
        studentList: payload,
      }

    case "roll":
      return {
        ...state,
        isRollMode: payload,
      }

    case "sort":
      return {
        ...state,
        sortOptions: { ...state.sortOptions, ...payload },
      }

    case "search":
      return {
        ...state,
        filterOptions: { ...state.filterOptions, ...payload },
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
