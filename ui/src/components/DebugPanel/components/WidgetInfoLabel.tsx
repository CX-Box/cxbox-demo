import React from 'react'
import InfoLabel from './InfoLabel'

const WidgetInfoLabel: React.FunctionComponent<{ infoList: string[]; noContainer?: boolean }> = ({ infoList, noContainer }) => {
    return <InfoLabel label="Widget" info={infoList} noContainer={noContainer} />
}

export default React.memo(WidgetInfoLabel)
