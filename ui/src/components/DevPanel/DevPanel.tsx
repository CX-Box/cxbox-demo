import React from 'react'
import { useAppSelector } from '@store'
import { DevToolsPanel } from '@cxboxComponents'

const DevPanel: React.FunctionComponent = () => {
    const showCondition = useAppSelector(state => state.session.devPanelEnabled)
    if (!showCondition) {
        return null
    }
    return <DevToolsPanel />
}

export default React.memo(DevPanel)
