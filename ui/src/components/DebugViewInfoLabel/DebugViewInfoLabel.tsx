import React, { FC } from 'react'
import { useAppSelector } from '@store'
import ViewInfoLabel from '@components/DebugPanel/components/ViewInfoLabel'

interface Props {}

const DebugViewInfoLabel: FC<Props> = () => {
    const debugMode = useAppSelector(state => state.session.debugMode || false)

    return debugMode ? <ViewInfoLabel /> : null
}

export default DebugViewInfoLabel
