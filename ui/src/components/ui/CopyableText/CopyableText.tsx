import React, { useRef } from 'react'
import { Icon, Input } from 'antd'
import cn from 'classnames'
import styles from './CopyableText.module.less'

interface CopyableTextProps {
    text: string
    className?: string
}

const CopyableText: React.FunctionComponent<CopyableTextProps> = props => {
    const { text, className } = props
    const textRef = useRef<Input>(null)
    const handleCopyDetails = React.useCallback(() => {
        textRef.current?.select()
        document.execCommand('copy')
    }, [textRef])

    return (
        <Input
            className={cn(styles.copyableText, className)}
            size="small"
            ref={textRef}
            value={text}
            addonAfter={<Icon type="copy" onClick={handleCopyDetails} />}
        />
    )
}

export default React.memo(CopyableText)
