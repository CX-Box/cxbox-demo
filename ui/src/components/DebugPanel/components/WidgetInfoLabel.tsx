import React from 'react'
import InfoLabel from './InfoLabel'

const WidgetInfoLabel: React.FunctionComponent<{ infoList: string[]; noContainer?: boolean }> = ({ infoList, noContainer }) => {
    return <InfoLabel label="Widget" info={infoList} noContainer={noContainer} />
}

const MemoizedWidgetInfoLabel = React.memo(WidgetInfoLabel)
export default MemoizedWidgetInfoLabel
