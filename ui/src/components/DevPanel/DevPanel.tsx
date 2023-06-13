import React from 'react'
import { DevToolsPanel } from '@teslerComponents'
import { useSelector } from 'react-redux'
import { AppState } from '../../interfaces/storeSlices'

const DevPanel: React.FunctionComponent = () => {
    const showCondition = useSelector((state: AppState) => state.session.devPanelEnabled)
    if (!showCondition) {
        return null
    }
    return <DevToolsPanel />
}

export default React.memo(DevPanel)
