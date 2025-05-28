import React from 'react'
import { useAppSelector } from '@store'
import DevToolsPanel from '@components/DevToolsPanel/DevToolsPanel'

const DevPanel: React.FunctionComponent = () => {
    const showCondition = useAppSelector(state => state.session.devPanelEnabled)
    if (!showCondition) {
        return null
    }
    return <DevToolsPanel />
}

export default React.memo(DevPanel)
