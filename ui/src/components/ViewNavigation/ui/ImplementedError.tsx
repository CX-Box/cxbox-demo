import React, { useEffect } from 'react'

interface ImplementedErrorProps {
    text?: string
}

export const ImplementedError: React.FC<ImplementedErrorProps> = ({ text, children }) => {
    useEffect(() => {
        console.error(text)
    }, [text])

    return <>{children}</>
}
