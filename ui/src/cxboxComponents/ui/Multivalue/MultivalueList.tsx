import React from 'react'
import styles from './MultivalueList.less'
import cn from 'classnames'
import MultiValueListRecord from '@cxboxComponents/Multivalue/MultiValueListRecord'
import { interfaces } from '@cxbox-ui/core'

export interface MultivalueListProps {
    fieldTitle: React.ReactNode
    field: interfaces.MultivalueFieldMeta
    data: interfaces.MultivalueSingleValue[]
    isFloat: boolean
    noLineSeparator: boolean
    isColumnDirection?: boolean
    className?: string
}

/**
 *
 * @param props
 * @category Components
 */
const MultivalueList: React.FunctionComponent<MultivalueListProps> = props => {
    return (
        <div
            key={`${props.field.key}_${props.field.label}`}
            className={cn(props.className, {
                [styles.fieldAreaFloat]: props.isFloat,
                [styles.fieldAreaBase]: !props.isFloat,
                [styles.noFieldSeparator]: props.noLineSeparator,
                [styles.fieldAreaDirection]: props.isColumnDirection
            })}
        >
            <div
                className={cn({
                    [styles.labelAreaFloat]: props.isFloat,
                    [styles.labelAreaBase]: !props.isFloat,
                    [styles.lableDirection]: props.isColumnDirection
                })}
            >
                {props.fieldTitle}
            </div>
            <div
                className={cn({
                    [styles.fieldDataFloat]: props.isFloat,
                    [styles.fieldDataBase]: !props.isFloat
                })}
            >
                {props.data.map((multivalueSingleValue, index) => {
                    return <MultiValueListRecord key={index} isFloat={props.isFloat} multivalueSingleValue={multivalueSingleValue} />
                })}
            </div>
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedMultivalueList = React.memo(MultivalueList)

export default MemoizedMultivalueList
