import React, { useRef } from 'react'
import styles from './Card.less'
import cn from 'classnames'
import Operations, { OperationsProps } from '@components/widgets/CardCarouselList/Operations'

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, Partial<OperationsProps> {}

const Card: React.FC<CardProps> = ({ children, getOperationProps, operations, ...attr }) => {
    const cardRef = useRef<HTMLDivElement>(null)
    return (
        <div {...attr} ref={cardRef} className={cn(styles.root, attr.className)}>
            <span className={styles.buttons}>
                {operations?.length && <Operations getOperationProps={getOperationProps} operations={operations} />}
            </span>
            {children}
        </div>
    )
}

export default Card
