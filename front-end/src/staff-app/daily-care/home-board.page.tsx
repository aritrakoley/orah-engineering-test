import React, { useEffect, useCallback, useContext } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { RollContext } from "staff-app/providers/RollProvider"

type SortOptionsType = {
  asc: boolean
  byFirstName: boolean
}
type FilterOptionsType = {
  name: string
  attendance: string
}
export const HomeBoardPage: React.FC = () => {
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  const { state, dispatch } = useContext(RollContext)

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    if (data && data.students) dispatch({ type: "data", payload: updateList(data.students, state.sortOptions, state.filterOptions) })
  }, [data, state.sortOptions, state.filterOptions])

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      dispatch({ type: "roll", payload: false })
    }
  }

  // Helpers -----------------
  const sortStudents = useCallback((list: any[], sortOptions: SortOptionsType) => {
    const { asc, byFirstName } = sortOptions

    const studentCompare = (a: any, b: any) => {
      const _a = byFirstName ? a.first_name : a.last_name
      const _b = byFirstName ? b.first_name : b.last_name

      const res = _a.localeCompare(_b)
      return asc ? res : -res
    }

    list.sort(studentCompare)
    return [...list]
  }, [])

  const filterStudents = useCallback((list: any[], filterOptions: FilterOptionsType) => {
    const { name, attendance } = filterOptions
    return list.filter((e) => `${e.first_name} ${e.last_name}`.toLowerCase().includes(name.toLowerCase()) && (!attendance || e.attendance === attendance))
  }, [])

  const updateList = useCallback((list: any[], sortOptions: SortOptionsType, filterOptions: FilterOptionsType) => {
    return sortStudents(filterStudents(list, filterOptions), sortOptions)
  }, [])
  //--------------------------

  console.log(state)
  return (
    <>
      <S.PageContainer>
        <Toolbar />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && state.studentList && (
          <>
            {state.studentList.map((s: any) => (
              <StudentListTile key={s.id} isRollMode={state.isRollMode} student={s} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={state.isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}

const Toolbar: React.FC = () => {
  const { state, dispatch } = useContext(RollContext)
  return (
    <S.ToolbarContainer>
      <div>
        <span style={{ cursor: "pointer" }} onClick={() => dispatch({ type: "sort", payload: { byFirstName: !state.sortOptions.byFirstName } })}>
          {state.sortOptions.byFirstName ? "First" : "Last"} Name
        </span>
        <span style={{ cursor: "pointer", marginLeft: "10px" }} onClick={() => dispatch({ type: "sort", payload: { asc: !state.sortOptions.asc } })}>
          <FontAwesomeIcon icon={state.sortOptions.asc ? faArrowUp : faArrowDown} />
        </span>
      </div>
      <div>
        <S.TextInput placeholder="Search" value={state.filterOptions.name} onChange={(e) => dispatch({ type: "search", payload: { name: e.target.value } })} />
      </div>
      <S.Button onClick={() => dispatch({ type: "roll", payload: true })}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  TextInput: styled.input`
    width: 100%;
    padding: 5px;
    border-radius: 5px;
    border: 2px solid transparent;
  `,
}
