import React, { useState, useEffect, useCallback } from "react"
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

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [sortOptions, setSortOptions] = useState({ asc: true, byFirstName: true })
  const [studentList, setStudentList] = useState<Person[]>([])
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    console.log("data effect", data)
    if (data && data.students !== studentList) setStudentList(sortStudents(data.students, sortOptions))
  }, [data])

  const onToolbarAction = (action: ToolbarAction, data?: any) => {
    switch (action) {
      case "roll":
        setIsRollMode(true)
        break

      case "sort":
        setSortOptions(data)
        setStudentList(sortStudents(studentList, data))
        break
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  const sortStudents = useCallback((list: Person[], sortOptions) => {
    const { asc, byFirstName } = sortOptions

    const studentCompare = (a: Person, b: Person) => {
      const _a = byFirstName ? a.first_name : a.last_name
      const _b = byFirstName ? b.first_name : b.last_name

      const res = _a.localeCompare(_b)
      return asc ? res : -res
    }

    list.sort(studentCompare)
    return [...list]
  }, [])

  console.log({ studentList })
  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} sortOptions={sortOptions} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && studentList && (
          <>
            {studentList.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: any) => void
  sortOptions: { asc: boolean; byFirstName: boolean }
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, sortOptions } = props
  const { asc, byFirstName } = sortOptions
  return (
    <S.ToolbarContainer>
      <div>
        <span style={{ cursor: "pointer" }} onClick={() => onItemClick("sort", { asc, byFirstName: !byFirstName })}>
          {byFirstName ? "First" : "Last"} Name
        </span>
        <span style={{ cursor: "pointer", marginLeft: "10px" }} onClick={() => onItemClick("sort", { byFirstName, asc: !asc })}>
          <FontAwesomeIcon icon={asc ? faArrowUp : faArrowDown} />
        </span>
      </div>
      <div>Search</div>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
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
}
