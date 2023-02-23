import React, { useContext } from "react"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"
import { Spacing, FontWeight } from "shared/styles/styles"
import { Roll, RolllStateType } from "shared/models/roll"
import { RollContext } from "staff-app/providers/RollProvider"

interface Props {
  stateList: StateList[]
  onItemClick?: (type: ItemType) => void
  size?: number
}
export const RollStateList: React.FC<Props> = ({ stateList, size = 14, onItemClick }) => {
  const { state, dispatch } = useContext(RollContext)
  const onClick = (type: ItemType) => {
    if (onItemClick) {
      onItemClick(type)
    }
  }

  const getRollSummary = (rollMap: Map<number, RolllStateType>) => {
    const summary = [
      { type: "all", count: state.studentList.length },
      { type: "present", count: 0 },
      { type: "late", count: 0 },
      { type: "absent", count: 0 },
    ]

    rollMap.forEach((val, key) => {
      switch (val) {
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
    })

    return summary
  }

  return (
    <S.ListContainer>
      {getRollSummary(state.rollOptions.rollMap).map((s, i) => {
        if (s.type === "all") {
          return (
            <S.ListItem key={i}>
              <FontAwesomeIcon icon="users" size="sm" style={{ cursor: "pointer" }} onClick={() => onClick(s.type as RolllStateType)} />
              <span>{s.count}</span>
            </S.ListItem>
          )
        }

        return (
          <S.ListItem key={i}>
            <RollStateIcon type={s.type as RolllStateType} size={size} onClick={() => onClick(s.type as RolllStateType)} />
            <span>{s.count}</span>
          </S.ListItem>
        )
      })}
    </S.ListContainer>
  )
}

const S = {
  ListContainer: styled.div`
    display: flex;
    align-items: center;
  `,
  ListItem: styled.div`
    display: flex;
    align-items: center;
    margin-right: ${Spacing.u2};

    span {
      font-weight: ${FontWeight.strong};
      margin-left: ${Spacing.u2};
    }
  `,
}

interface StateList {
  type: ItemType
  count: number
}

type ItemType = RolllStateType | "all"
