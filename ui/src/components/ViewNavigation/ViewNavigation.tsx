import React from 'react'
import { TabsProps } from 'antd/es/tabs'
import { StandardViewNavigation } from '@components/ViewNavigation/tab/standard/StandardViewNavigation'
import { useNavigationType } from '@hooks/useNavigationType'
import { ImplementedError } from '@components/ViewNavigation/ui/ImplementedError'

interface ViewNavigationProps extends Pick<TabsProps, 'type'> {
    depth?: number
}

export function ViewNavigation({ depth = 1, type: uiType }: ViewNavigationProps) {
    const navigationType = useNavigationType()

    if (navigationType === 'standard') {
        return <StandardViewNavigation depth={depth} type={uiType} />
    }

    return (
        <ImplementedError text={`Navigation with type ${navigationType} not implemented`}>
            <StandardViewNavigation depth={depth} type={uiType} />
        </ImplementedError>
    )
}

export default React.memo(ViewNavigation)
