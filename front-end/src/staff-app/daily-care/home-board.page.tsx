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
  const [searchQuery, setSearchQuery] = useState("")
  const [studentList, setStudentList] = useState<Person[]>([])
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    if (data && data.students) setStudentList(updateList(data.students, sortOptions, searchQuery))
  }, [data, sortOptions, searchQuery])

  const onToolbarAction = (action: ToolbarAction, payload?: any) => {
    switch (action) {
      case "roll":
        setIsRollMode(true)
        break

      case "sort":
        setSortOptions(payload)
        break

      case "search":
        setSearchQuery(payload)
        break
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  // Helpers -----------------
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

  const filterStudents = useCallback((list: Person[], query: string) => {
    return list.filter((e) => `${e.first_name} ${e.last_name}`.toLowerCase().includes(query.toLowerCase()))
  }, [])

  const updateList = useCallback((list: any[], sortOptions: any, searchQuery: any) => {
    return sortStudents(filterStudents(list, searchQuery), sortOptions)
  }, [])
  //--------------------------

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} sortOptions={sortOptions} searchQuery={searchQuery} />

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

type ToolbarAction = "roll" | "sort" | "search"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: any) => void
  sortOptions: { asc: boolean; byFirstName: boolean }
  searchQuery: string
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, sortOptions, searchQuery } = props
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
      <div>
        <S.TextInput placeholder="Search" value={searchQuery} onChange={(e) => onItemClick("search", e.target.value)} />
      </div>
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
  TextInput: styled.input`
    width: 100%;
    padding: 5px;
    border-radius: 5px;
    border: 2px solid transparent;
  `,
}

/* Notes:
1. Reusing onItemClick to also detect onChange events on the input component:
  a. To keep ToolBarActions handling in the same place
  b. To keep code DRY
  although this makes onItemClick a misleading function name

2. Handling List updates
Approach 1: Searching is significantly more frequent
  Sort always sorts the entire list and stores it as state
  Search filters the sorted list and displays it based on query

Approach 2: Update the displayed list any time there's a change in data, sort or search parameters
  Any time data, sortOptions or searchQuery is changed:
  a. List is filtered by searchQuery
  b. Smaller filtered list is then sorted
  c. Updated list is displayed
*/
