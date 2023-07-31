/*
 * © OOO "SI IKS LAB", 2022-2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import styles from './ReadOnlyField.less'
import cn from 'classnames'
import { WidgetFieldBase } from '@cxbox-ui/core/interfaces/widget'
import { ActionLink, SearchHighlight } from '@cxbox-ui/core'
import { useWidgetHighlightFilter } from '../../../hooks/useWidgetFilter'
import { escapedSrc } from '../../../utils/strings'

export interface ReadOnlyFieldProps {
    /**
     * TODO: Will be mandatory in 2.0.0
     */
    widgetName?: string
    /**
     * TODO: Will be mandatory in 2.0.0
     */
    cursor?: string
    meta?: WidgetFieldBase
    backgroundColor?: string
    className?: string
    onDrillDown?: () => void
    children: React.ReactNode
}

/**
 *
 * @param props
 * @category Components
 */
const ReadOnlyField: React.FunctionComponent<ReadOnlyFieldProps> = props => {
    const filter = useWidgetHighlightFilter(props.widgetName as string, props.meta?.key as string)
    const displayedValue = filter ? (
        <SearchHighlight
            source={(props.children || '').toString()}
            search={escapedSrc(filter?.value?.toString() as string)}
            match={formatString => <b>{formatString}</b>}
        />
    ) : (
        props.children
    )
    return (
        <span
            className={cn(styles.readOnlyField, { [styles.coloredField]: props.backgroundColor }, props.className)}
            style={props.backgroundColor ? { backgroundColor: props.backgroundColor } : undefined}
        >
            {props.onDrillDown ? <ActionLink onClick={props.onDrillDown}>{displayedValue}</ActionLink> : displayedValue}
        </span>
    )
}

export default React.memo(ReadOnlyField)
