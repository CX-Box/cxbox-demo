/**
 * Интерактивных полей ввода, которые нуждаются в префиксах/суффиксах компонента <Input />,
 * но сделаны на основе другого компонента (например Select)
 *
 * TODO:
 * - перенести на них InlinePickList
 * - перенести на них MultivalueTag
 * - согласовать цвета рамочек по макетам (у MultivalueTag рамочка темнее чем у обычных)
 * - сделать префиксы
 */

import React, { FunctionComponent } from 'react'
import cn from 'classnames'
import styles from './InteractiveInput.less'

export interface InteractiveInputProps {
    suffixClassName?: string
    suffix?: React.ReactNode
    children: React.ReactNode
    onSuffixClick?: () => void
}

/**
 *
 * @param props
 * @category Components
 */
export const InteractiveInput: FunctionComponent<InteractiveInputProps> = props => {
    return (
        <div className={styles.container}>
            {props.children}
            {props.suffix && (
                <button className={cn(styles.button, styles.suffix, props.suffixClassName)} onClick={props.onSuffixClick}>
                    {props.suffix}
                </button>
            )}
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedInteractiveInput = React.memo(InteractiveInput)

export default MemoizedInteractiveInput
