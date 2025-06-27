import React, { CSSProperties, useRef } from 'react'
import { Icon, Input } from 'antd'

interface CopyableTextProps {
    text: string
    className?: string
}

const inputStyle: CSSProperties = { width: 300 }

const CopyableText: React.FunctionComponent<CopyableTextProps> = props => {
    const { text, className } = props
    const textRef = useRef<Input>(null)
    const handleCopyDetails = React.useCallback(() => {
        textRef.current?.select()
        document.execCommand('copy')
    }, [textRef])

    return (
        <Input
            className={className}
            size="small"
            ref={textRef}
            value={text}
            style={inputStyle}
            addonAfter={<Icon type="copy" onClick={handleCopyDetails} />}
        />
    )
}

export default React.memo(CopyableText)
