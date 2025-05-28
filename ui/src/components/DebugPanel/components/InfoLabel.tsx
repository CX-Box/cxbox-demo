import React from 'react'
import cn from 'classnames'
import CopyableText from '../../ui/CopyableText/CopyableText'
import styles from './InfoLabel.less'

interface InfoLabelProps {
    label: string
    info: string[]
    noContainer?: boolean
}

const InfoLabel: React.FunctionComponent<InfoLabelProps> = props => {
    const { label, info, noContainer } = props
    const content = (
        <>
            <span className={styles.label}>{label}</span>
            {info.map((item, index) => (
                <CopyableText
                    className={cn(styles.element, {
                        [styles.halfElement]: index > 0 && !item.includes('bc')
                    })}
                    text={item}
                    key={item}
                />
            ))}
        </>
    )

    return noContainer ? content : <div className={styles.container}>{content}</div>
}

export default React.memo(InfoLabel)
