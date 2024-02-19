import React, { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
    children?: ReactNode
    getContainer: () => Element | null
}

const Portal = ({ children, getContainer }: PortalProps) => {
    const container = getContainer()

    return <>{container && createPortal(children, container)}</>
}

export default React.memo(Portal)
