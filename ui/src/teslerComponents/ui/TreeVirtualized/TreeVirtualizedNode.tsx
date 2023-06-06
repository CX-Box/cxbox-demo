/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import { ListChildComponentProps } from 'react-window'
import { Icon, Checkbox } from 'antd'
import styles from './TreeVirtualizedNode.less'
import { useSelector } from 'react-redux'
import { Store } from '@interfaces/store'
import { TreeNodeBidirectional } from '@tesler-ui/core'
import { WidgetListField } from '@tesler-ui/core'
import { BcFilter } from '@tesler-ui/core'
import SearchHightlight from '@teslerComponents/ui/SearchHightlight/SearchHightlight'
import { escapedSrc } from '@tesler-ui/core'

/**
 * Properties for `TreeVirtualizedNode` component
 *
 * @typeParam T Type of node item
 */
export interface TreeVirtualizedNodeData<T> {
    /**
     * All items that can be displayed as nodes
     */
    items: Array<T & TreeNodeBidirectional>
    /**
     * Fields of the item that should be displayed as columns
     */
    fields: WidgetListField[]
    /**
     * An array of ids of expanded nodes
     */
    expandedItems: string[]
    /**
     * Allow selecting multiple items
     */
    multiple?: boolean
    /**
     * Fields with values matching this expression will be highlighted;
     *
     * @see {@link src/utils/strings.ts#escapedSrc} for details how search expression is escaped
     */
    filters?: BcFilter[]
    /**
     * Custom renderer for matching values
     */
    searchHighlighter?: (value: string) => React.ReactNode
    /**
     * Fires when expanding/collapsing node
     */
    onToggle: (id: string) => void
    /**
     * Fires when selectin a node
     */
    onSelect?: ((item: T) => void) | ((item: T, selected: boolean) => void)
}

/**
 * Overriding `react-window` node data with tree-specific properties
 */
export interface TreeVirtualizedNodeProps<T> extends ListChildComponentProps {
    data: TreeVirtualizedNodeData<T>
}

/**
 * Default implementation of node renderer for virtualized trees
 *
 * Should not be extended with new features, rather it should be overriden entirely for customizations.
 *
 * @param props Component props
 * @typeParam T Type of node item
 * @category Components
 */
export function TreeVirtualizedNode<T extends TreeNodeBidirectional>(props: TreeVirtualizedNodeProps<T>) {
    const data = props.data
    const item = data.items[props.index]
    const expanded = data.expandedItems?.includes(item.id)
    const pendingSelected = useSelector((store: Store) => {
        return Object.values(store.view.pendingDataChanges)?.[0]
    })
    const checked = pendingSelected?.[item.id] === undefined ? (item as any)._associate : pendingSelected?.[item.id]._associate
    return (
        <div className={styles.row} style={props.style}>
            {data.multiple && (
                <div className={styles.controls}>
                    <Checkbox checked={checked} onChange={() => data.onSelect(item, !checked)} />
                </div>
            )}
            <div className={styles.controls}>
                {item.children?.length && (
                    <button className={styles.button} onClick={() => data.onToggle(item.id)}>
                        <Icon className={styles.icon} type={expanded ? 'minus-square' : 'plus-square'} />
                    </button>
                )}
            </div>
            {data.fields?.map((field: WidgetListField) => {
                const filter = data.filters?.find(f => f.fieldName === field.key)
                const source = String((item as any)[field.key] ?? '')
                const content = filter ? (
                    <SearchHightlight source={source} search={escapedSrc(filter.value as string)} match={data.searchHighlighter} />
                ) : (
                    source
                )
                const onClick = data.multiple
                    ? () => (data.onSelect as (d: T, selected: boolean) => void)?.(item, !checked)
                    : () => (data.onSelect as (d: T) => void)?.(item)
                return (
                    <div
                        key={field.key}
                        className={styles.column}
                        style={field.width ? { minWidth: field.width, maxWidth: field.width } : undefined}
                        onClick={onClick}
                    >
                        <div className={styles.content}>{content}</div>
                    </div>
                )
            })}
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedTreeVirtualizedNode = React.memo(TreeVirtualizedNode)

export default MemoizedTreeVirtualizedNode
