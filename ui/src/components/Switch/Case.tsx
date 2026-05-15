import React, { ReactNode } from 'react'

interface CaseProps {
    value: string | number | boolean | undefined | null
    children?: ReactNode
}

const Case: React.FC<CaseProps> = ({ children }) => {
    return <>{children}</>
}

export default Case
