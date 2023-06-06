import React, { CSSProperties } from 'react'
import { Icon, Input } from 'antd'

interface CopyableTextProps {
    text: string
    className?: string
}

const CopyableText: React.FunctionComponent<CopyableTextProps> = props => {
    const { text, className } = props
    const textRef = React.useRef(null)
    const handleCopyDetails = React.useCallback(() => {
        textRef.current.select()
        document.execCommand('copy')
    }, [textRef])
    const inputStyle: CSSProperties = { width: 300 }
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
