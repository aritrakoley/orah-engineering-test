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
  const [sortAsc, setSortAsc] = useState(true)
  const [sortBy, setSortBy] = useState("first_name")
  const [studentList, setStudentList] = useState<Person[]>([])
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }

    switch (action) {
      case "sort":
        setSortAsc(!sortAsc)
        break
      case "sort-by":
        setSortBy((sortBy) => (sortBy === "first_name" ? "last_name" : "first_name"))
        break
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  const sortStudents = useCallback((list: Person[], asc: boolean, field: string) => {
    const studentCompare = (a: Person, b: Person) => {
      let af, bf
      if (field === "first_name") {
        af = a.first_name
        bf = b.first_name
      } else {
        af = a.last_name
        bf = b.last_name
      }
      const res = af.localeCompare(bf)
      return asc ? res : -res
    }
    list.sort(studentCompare)
    return [...list]
  }, [])

  useEffect(() => {
    console.log("data effect", data)
    if (data && data.students !== studentList) {
      const sortedData = sortStudents(data.students, sortAsc, sortBy)
      setStudentList(sortedData)
    }
  }, [data])

  useEffect(() => {
    console.log("sort effect", [studentList, sortAsc, sortBy])
    if (!studentList) return

    const sortedList = sortStudents(studentList, sortAsc, sortBy)
    setStudentList(sortedList)
  }, [sortAsc, sortBy])

  console.log({ studentList })
  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} sortAsc={sortAsc} sortBy={sortBy} />

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

type ToolbarAction = "roll" | "sort" | "sort-by"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  sortAsc: boolean
  sortBy: string
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, sortAsc, sortBy } = props
  return (
    <S.ToolbarContainer>
      <div>
        <span style={{ cursor: "pointer" }} onClick={() => onItemClick("sort-by")}>
          {sortBy === "first_name" ? "First" : "Last"} Name
        </span>
        <span style={{ cursor: "pointer", marginLeft: "10px" }} onClick={() => onItemClick("sort")}>
          <FontAwesomeIcon icon={sortAsc ? faArrowUp : faArrowDown} />
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
