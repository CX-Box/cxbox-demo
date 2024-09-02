import React from 'react'
import { DevToolsPanel } from '@cxboxComponents'
import { useMeta } from '../../hooks/queries'

const DevPanel: React.FunctionComponent = () => {
    const { data } = useMeta()
    if (!data?.devPanelEnabled) {
        return null
    }
    return <DevToolsPanel />
}

export default React.memo(DevPanel)
