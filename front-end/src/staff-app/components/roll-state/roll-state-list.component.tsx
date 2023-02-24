import React, { useContext } from "react"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"
import { Spacing, FontWeight } from "shared/styles/styles"
import { Roll, RolllStateType } from "shared/models/roll"
import { RollContext } from "staff-app/providers/RollProvider"
import { getRollSummary } from "staff-app/providers/utils"

interface Props {
  onItemClick?: (type: ItemType) => void
  size?: number
}
export const RollStateList: React.FC<Props> = ({ size = 14, onItemClick }) => {
  const { state, dispatch } = useContext(RollContext)
  const onClick = (type: ItemType) => {
    if (onItemClick) {
      onItemClick(type)
    } else {
      dispatch({ type: "search", payload: { rollState: type } })
    }
  }

  const summary = getRollSummary(state.studentList)
  return (
    <S.ListContainer>
      {summary.map((s, i) => {
        if (s.type === "all") {
          return (
            <S.ListItem key={i}>
              <FontAwesomeIcon icon="users" size="sm" style={{ cursor: "pointer" }} onClick={() => onClick(s.type as RolllStateType)} />
              <span>
                {summary[1].count + summary[2].count + summary[3].count} / {s.count}
              </span>
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
