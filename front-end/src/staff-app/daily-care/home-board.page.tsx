import React, { useEffect, useContext, useState } from "react"
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
import { ActiveRollOverlay /*ActiveRollAction*/ } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { RollContext } from "staff-app/providers/RollProvider"
import { getListToDisplay } from "../providers/utils"

export const HomeBoardPage: React.FC = () => {
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  const { state, dispatch } = useContext(RollContext)
  const [displayList, setDisplayList] = useState<Person[]>([])

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    if (data && data.students) dispatch({ type: "update", payload: data.students })
  }, [data])

  useEffect(() => {
    setDisplayList(getListToDisplay(state.studentList, state.sortOptions, state.filterOptions))
  }, [state.studentList, state.sortOptions, state.filterOptions])

  // const onActiveRollAction = (action: ActiveRollAction) => {
  //   if (action === "exit") {
  //     dispatch({ type: "roll", payload: { isRollMode: false } })
  //   }
  // }

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

        {loadState === "loaded" && displayList && (
          <>
            {displayList.map((s: Person) => (
              <StudentListTile key={s.id} student={s} />
            ))}
          </>
        )}

        {loadState === "loaded" && displayList.length === 0 && (
          <CenteredContainer>
            <div>No students to display</div>
          </CenteredContainer>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={state.isRollMode} /*onItemClick={onActiveRollAction}*/ />
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
