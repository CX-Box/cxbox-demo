import React from 'react'
import CopyableText from '@cxboxComponents/ui/CopyableText/CopyableText'
import styles from './InfoLabel.less'

interface InfoLabelProps {
    label: string
    info: string[]
}
const InfoLabel: React.FunctionComponent<InfoLabelProps> = props => {
    const { label, info } = props
    return (
        <div className={styles.container}>
            <span className={styles.wrapper}>{label}</span>
            {info.map(i => (
                <CopyableText className={styles.wrapper} text={i} key={i} />
            ))}
        </div>
    )
}
const MemoizedInfoLabel = React.memo(InfoLabel)
export default MemoizedInfoLabel
