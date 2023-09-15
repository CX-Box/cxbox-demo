import React from 'react'
import { DevToolsPanel } from '@teslerComponents'
import { useAppSelector } from '../../store'

const DevPanel: React.FunctionComponent = () => {
    const showCondition = useAppSelector(state => state.session.devPanelEnabled)
    if (!showCondition) {
        return null
    }
    return <DevToolsPanel />
}

export default React.memo(DevPanel)
