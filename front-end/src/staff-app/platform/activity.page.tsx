import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { useApi } from "shared/hooks/use-api"
import { Colors } from "shared/styles/colors"
import { faCaretDown, faClipboardList, faExclamation, faWindowClose } from "@fortawesome/free-solid-svg-icons"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { RollStateList } from "staff-app/components/roll-state/roll-state-list.component"
import { filterStudents, getRollSummary, ItemType, markAttendance, toTitleCase } from "staff-app/providers/utils"
import { Person } from "shared/models/person"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"

export const ActivityPage: React.FC = () => {
  const [getActivities, data, loadState] = useApi<{ activity: any[] }>({ url: "get-activities" })
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [modalData, setModalData] = useState(false)

  useEffect(() => {
    void getActivities()
  }, [getActivities])

  const getIcon = (type: string) => {
    switch (type) {
      case "roll":
        return faClipboardList
      default:
        return faExclamation
    }
  }

  const formatDateTime = (date: string) => {
    const f = (x: number) => (x < 10 ? "0" + x : "" + x)

    const dt = new Date(date)
    let dd = f(dt.getDate())
    let mm = f(dt.getMonth() + 1)
    let yyyy = dt.getFullYear()

    let h = f(dt.getHours())
    let m = f(dt.getMinutes())
    let s = f(dt.getSeconds())

    return `${dd}-${mm}-${yyyy} ${h}:${m}:${s}`
  }

  const handleDetailButtonClick = (e: React.MouseEvent, data: any) => {
    data.rollData.sort((a: any, b: any) => a.student_id - b.student_id)
    setModalData(data)
    setModalIsOpen(true)
  }

  const getDetailsComponent = (a: any) => {
    switch (a.type) {
      case "roll":
        return (
          <S.Details>
            <S.Info>
              <S.Name>{a.entity.name}</S.Name>
              <S.Date>Completed At: {formatDateTime(a.entity.completed_at)}</S.Date>
            </S.Info>

            <S.Button onClick={(e) => handleDetailButtonClick(e, { rollData: a.entity.student_roll_states, header: "attendance" })}>
              <FontAwesomeIcon icon={faCaretDown} />
            </S.Button>
          </S.Details>
        )
    }
  }

  console.log(data, modalIsOpen)
  return (
    <>
      <S.PageContainer>
        <S.ToolbarContainer>Activity Log</S.ToolbarContainer>

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" &&
          data &&
          data.activity.map((a) => (
            <S.ActivityContainer key={a.type + a.date}>
              <S.Icon>
                <FontAwesomeIcon icon={getIcon(a.type)} />
              </S.Icon>
              <S.Body>
                <S.Header>
                  <S.Type>
                    <div>{a.type[0].toUpperCase() + a.type.slice(1)}</div>
                  </S.Type>
                  <S.Date>
                    <div>{formatDateTime(a.date)}</div>
                  </S.Date>
                </S.Header>
                {getDetailsComponent(a)}
              </S.Body>
            </S.ActivityContainer>
          ))}
        {modalIsOpen ? <Modal data={modalData} onClose={(e: any) => setModalIsOpen(false)} /> : null}
      </S.PageContainer>
    </>
  )
}

type Props = {
  data: any
  onClose: any
}
const Modal: React.FC<Props> = ({ data, onClose }) => {
  const [getStudents, list, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  const [filter, setFilter] = useState<ItemType>("all")
  const [processedData, setProcessedData] = useState<any>()

  useEffect(() => {
    if (data.header === "attendance") getStudents()
  }, [getStudents])

  useEffect(() => {
    processData(data)
  }, [list])

  const processData = (data: any) => {
    switch (data.header) {
      case "attendance":
        if (loadState === "loaded" && list) {
          const markedData = markAttendance(list.students, data.rollData)
          setProcessedData({ ...data, rollData: markedData })
        }
    }
  }
  const onIconClick = (type: ItemType) => {
    setFilter(type)
  }

  const filteredData = { ...processedData, rollData: processedData ? filterStudents(processedData.rollData, { name: "", rollState: filter }) : undefined }
  const stateList = processedData ? getRollSummary(processedData.rollData) : []
  return (
    <S.Modal>
      <S.ModalContainer>
        <S.ModalHeader>
          <S.ModalTitle>{toTitleCase(data.header)}</S.ModalTitle>
          {processedData && processedData.header === "attendance" && loadState === "loaded" ? <RollStateList stateList={stateList} onItemClick={onIconClick} /> : null}
          <S.ModalCloseButton onClick={onClose}>
            <FontAwesomeIcon icon={faWindowClose} />
          </S.ModalCloseButton>
        </S.ModalHeader>
        {filteredData && filteredData.header === "attendance" && loadState === "loaded" ? (
          <>
            <div style={{ width: "90%", overflowY: "auto", padding: "10px" }}>
              {filteredData && filteredData.rollData.map((s: any) => <StudentListTile key={s.id} student={s} readOnly />)}
            </div>
          </>
        ) : (
          <div style={{ marginTop: "3rem" }}>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </div>
        )}
      </S.ModalContainer>
    </S.Modal>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 40%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      width: 1.5rem;
      height: 1.5rem;
      margin auto 5px;
      padding: ${Spacing.u2};
      font-size: 1.5rem;
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.rounded};
      background-color: #ffbd00;
    }
  `,
  TextInput: styled.input`
    width: 100%;
    padding: 5px;
    border-radius: 5px;
    border: 2px solid transparent;
  `,
  ActivityContainer: styled.div`
    margin-top: ${Spacing.u3};
    display: flex;
    height: fit-content;
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0 2px 7px rgba(5, 66, 145, 0.13);
    transition: box-shadow 0.3s ease-in-out;
    &:hover {
      box-shadow: 0 2px 7px rgba(5, 66, 145, 0.26);
    }
  `,
  Icon: styled.div`
    display: flex;
    background-color: #90e0ef;
    justify-content: center;
    align-items: center;
    font-size: 3.5rem;
    width: 80px;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
  `,
  Body: styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: start;
    align-items: stretch;
  `,
  Header: styled.div`
    box-sizing: border-box;
    width: 100%;
    display: flex;
    padding-bottom: 4px;
    padding-top: 4px;
    padding-right: 4px;
    background-color: #90e0ef;
    justify-content: space-between;
    align-items: center;
    border-top-right-radius: 10px;
  `,
  Type: styled.div`
    color: ${Colors.dark.base};
    font-size: 1rem;
    padding-left: 10px;
    padding-right: 10px;
    font-weight: ${FontWeight.strong};
    background-color: #d9ed92;
    border-radius: 5px;
  `,
  Date: styled.div`
    display: flex;
    padding-right: 10px;
    padding-left: 10px;
    justify-content: start;
    align-items: center;
    background-color: #d0f4de;
    border-radius: 5px;
  `,
  Details: styled.div`
    box-sizing: border-box;
    display: flex;
    flex-grow: 1;
    justify-content: start;
    align-items: start;
    padding: 5px;
    border-bottom-right-radius: 10px;
  `,
  Info: styled.div`
    display: flex;
    flex-grow: 1;
    flex-direction: column;
  `,
  Name: styled.div`
    flex-grow: 1;
    margin-bottom: 5px;
    color: ${Colors.dark.base};
    font-size: 1.2rem;
    font-weight: ${FontWeight.strong};
    background-color: #caf0f8;
    border-radius: 5px;
    padding-right: 10px;
    padding-left: 10px;
  `,
  Modal: styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  ModalContainer: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 40%;
    height: 80%;
    overflow-y: auto;
    border-radius: 10px;
    background-color: #fff;
  `,
  ModalHeader: styled.div`
    display: flex;
    justify-content: space-between;
    height: 30px;
    width: 100%;
    margin-bottom: 5px;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
    box-shadow: 0 2px 7px rgba(5, 66, 145, 0.5);
  `,
  ModalCloseButton: styled(Button)`
    && {
      width: 1.5rem;
      height: 1.5rem;
      margin: auto 5px;
      padding: ${Spacing.u2};
      font-size: 1.5rem;
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.rounded};
      color: red;
    }
  `,
  ModalTitle: styled.div`
    font-size: 1.3rem;
    font-weight: bold;
    padding: 0 1rem;
  `,
  RollItem: styled.div`
    display: flex;
    width: 12rem;
    padding: 0.2rem;
    justify-content: space-between;
    &:hover {
      box-shadow: 0 2px 7px rgba(5, 66, 145, 0.26);
    }
  `,
  RollItemId: styled.div<{ type: any }>`
    font-size: 1.2rem;
    text-align: center;
    width: 2rem;
    padding-left: 10px;
    padding-right: 10px;
    font-weight: ${FontWeight.strong};
    background-color: ${({ type }: any) => (type === "header" ? "#edf2f4" : "#caf0f8")};
    border-radius: 3px;
  `,
  RollItemState: styled.div<{ state: any }>`
    font-size: 1.2rem;
    width: 4rem;
    padding-left: 10px;
    padding-right: 10px;
    text-align: center;
    font-weight: ${FontWeight.strong};
    background-color: ${({ state }: any) => (state === "present" ? "#13943b" : state === "late" ? "#f5a623" : state === "absent" ? "#9b9b9b" : "#edf2f4")};
    border-radius: 5px;
  `,
}
