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

import React, { ComponentType } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { ListChildComponentProps } from 'react-window'
import TreeVirtualized from '@teslerComponents/ui/TreeVirtualized/TreeVirtualized'
import { Store } from '@interfaces/store'
import ColumnTitle from '@teslerComponents/ColumnTitle/ColumnTitle'
import styles from './FlatTree.less'
import { Checkbox } from 'antd'
import { WidgetTableMeta } from '@tesler-ui/core'
import { DataItem } from '@tesler-ui/core'
import { DataItemNode, TreeAssociatedRecord } from '@tesler-ui/core'
import { buildBcUrl } from '@tesler-ui/core'
import { FieldType } from '@tesler-ui/core'

/**
 * Properties for `FlatTreePopup` widget
 */
interface FlatTreeProps {
    /**
     * Widget configuration
     */
    meta: WidgetTableMeta
    /**
     * Widget width, default is 808px
     */
    width?: number
    /**
     * Widget height, default is 375px
     */
    height?: number
    /**
     * Height of item in the list, default is 60px
     */
    itemSize?: number
    /**
     * Allow selecting multiple items
     */
    multiple?: boolean
    /**
     * Customization of items renderer
     */
    children?: ComponentType<ListChildComponentProps>
    /**
     * Callback to fire when item is selected
     */
    onSelect?: ((selected: DataItem) => void) | ((record: TreeAssociatedRecord, selected: boolean) => void)
}

const emptyData: DataItemNode[] = []

/**
 * Widget dislaying tree-like data with items expandable into nested subtrees as
 * flat virtualized list of items.
 *
 * Data must be presorted (every parent is followed by its descendants) for this widget.
 *
 * @param props Widget props
 * @category Widgets
 */
export const FlatTree: React.FC<FlatTreeProps> = props => {
    const { meta, width = 808, height = 375, itemSize = 60 } = props
    const fields = React.useMemo(
        () =>
            meta.fields.filter(item => {
                return item.type !== FieldType.hidden && !item.hidden
            }),
        [meta.fields]
    )

    const { data, fieldsRowMeta } = useSelector((store: Store) => {
        const bc = store.screen.bo.bc[meta.bcName]
        const bcUrl = buildBcUrl(meta.bcName, true)
        const rowMeta = store.view.rowMeta[meta.bcName]?.[bcUrl]
        const loading = bc?.loading || !rowMeta
        return {
            data: loading ? emptyData : (store.data[meta.bcName] as DataItemNode[]),
            fieldsRowMeta: rowMeta?.fields
        }
    }, shallowEqual)

    const filters = useSelector((state: Store) => state.screen.filters[meta.bcName])

    return (
        <div>
            <div className={styles.filters} style={{ width }}>
                {props.multiple && (
                    <div className={styles.control}>
                        <Checkbox disabled />
                    </div>
                )}
                <div className={styles.control} />
                {fields.map(field => (
                    <div key={field.key} className={styles.column} style={width ? { maxWidth: field.width } : undefined}>
                        <ColumnTitle
                            key={field.key}
                            widgetName={props.meta.name}
                            widgetMeta={field}
                            rowMeta={fieldsRowMeta?.find(item => item.key === field.key)}
                        />
                    </div>
                ))}
            </div>
            <TreeVirtualized<DataItemNode>
                items={data}
                width={width}
                height={height}
                itemSize={itemSize}
                fields={fields}
                filters={filters}
                multiple={props.multiple}
                onSelect={props.onSelect}
            >
                {props.children}
            </TreeVirtualized>
        </div>
    )
}

/**
 * @category Widgets
 */
const MemoizedFlatTree = React.memo(FlatTree)

export default MemoizedFlatTree
