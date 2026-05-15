import React, { ReactNode } from 'react'

interface DefaultProps {
    children?: ReactNode
}

const Default: React.FC<DefaultProps> = ({ children }) => {
    return <>{children}</>
}

export default Default
