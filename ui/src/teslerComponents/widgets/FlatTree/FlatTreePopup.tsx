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
import { ListChildComponentProps } from 'react-window'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { FlatTree } from './FlatTree'
import { Store } from '@interfaces/store'
import { PopupFooter } from '@teslerComponents/ui/Popup/PopupFooter'
import { useSingleSelect } from './useSingleSelect'
import { useMultipleSelect } from './useMultipleSelect'
import { WidgetTableMeta } from '@cxbox-ui/core'
import { $do } from '@actions'
import { PickListPopup } from '@teslerComponents'

/**
 * Properties for `FlatTreePopup` widget
 */
export interface FlatTreePopupProps {
    /**
     * Widget configuration
     */
    meta: WidgetTableMeta
    /**
     * Customization of items renderer
     */
    children?: ComponentType<ListChildComponentProps>
}

/**
 * Popup widget dislaying tree-like data with items expandable into nested subtrees as
 * flat virtualized list of items.
 *
 * Data must be presorted (every parent is followed by its descendants) for this widget.
 *
 * @param props Widget props
 * @category Widgets
 */
export const FlatTreePopup: React.FC<FlatTreePopupProps> = ({ meta, children }) => {
    const {
        multiple,
        hierarchyGroupSelection,
        hierarchyGroupDeselection,
        hierarchyRadioAll,
        hierarchyRadio: hierarchyRootRadio
    } = meta.options ?? {}

    const bcName = meta.bcName
    const dispatch = useDispatch()

    const { parentBcName, parentCursor } = useSelector((store: Store) => {
        const parentName = store.screen.bo.bc[meta.bcName].parentName
        const parentBc = store.screen.bo.bc[parentName]
        return {
            parentBcName: parentName,
            parentCursor: parentBc.cursor
        }
    }, shallowEqual)

    const pickListDescriptor = useSelector((store: Store) => {
        return store.view.pickMap
    }, shallowEqual)

    const handleSingleSelect = useSingleSelect(pickListDescriptor, bcName, parentCursor, parentBcName)
    const handleMultipleSelect = useMultipleSelect(
        bcName,
        hierarchyGroupSelection,
        hierarchyGroupDeselection,
        hierarchyRadioAll,
        hierarchyRootRadio
    )
    const handleSelect = multiple ? handleMultipleSelect : handleSingleSelect

    const handleConfirmMultiple = React.useCallback(() => {
        dispatch($do.saveAssociations({ bcNames: [bcName] }))
        dispatch($do.bcCancelPendingChanges({ bcNames: [bcName] }))
        dispatch($do.closeViewPopup(null))
    }, [bcName, dispatch])

    const handleCancelMultiple = React.useCallback(() => {
        dispatch($do.closeViewPopup(null))
        dispatch($do.bcRemoveAllFilters({ bcName }))
        dispatch($do.bcCancelPendingChanges({ bcNames: [bcName] }))
    }, [bcName, dispatch])

    const footer = React.useMemo(() => {
        return multiple ? <PopupFooter onAccept={handleConfirmMultiple} onCancel={handleCancelMultiple} /> : null
    }, [multiple, handleCancelMultiple, handleConfirmMultiple])

    const components = React.useMemo(() => {
        return {
            table: (
                <FlatTree meta={meta} multiple={multiple} onSelect={handleSelect}>
                    {children}
                </FlatTree>
            ),
            footer
        }
    }, [meta, footer, multiple, children, handleSelect])

    return <PickListPopup widget={meta} components={components} disableScroll />
}

/**
 * @category Widgets
 */
const MemoizedFlatTreePopup = React.memo(FlatTreePopup)

export default MemoizedFlatTreePopup
