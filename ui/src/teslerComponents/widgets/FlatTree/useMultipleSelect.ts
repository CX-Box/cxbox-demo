import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Store } from '@interfaces/store'
import { TreeAssociatedRecord } from '@cxbox-ui/core'
import { $do, useAssocRecords } from '@cxbox-ui/core'

/**
 *
 * @param bcName
 * @param hierarchyGroupSelection
 * @param hierarchyGroupDeselection
 * @param hierarchyRadioAll
 * @param hierarchyRootRadio
 * @category Hooks
 */
export function useMultipleSelect(
    bcName: string,
    hierarchyGroupSelection: boolean,
    hierarchyGroupDeselection: boolean,
    hierarchyRadioAll: boolean,
    hierarchyRootRadio: boolean
) {
    const pendingChanges = useSelector((store: Store) => store.view.pendingDataChanges[bcName])
    const assocValueKey = useSelector((store: Store) => store.view.popupData?.assocValueKey)
    const data = useSelector((store: Store) => store.data[bcName] as TreeAssociatedRecord[])
    const selectedRecords = useAssocRecords(data, pendingChanges)
    const widget = useSelector((store: Store) => store.view.widgets.find(item => item.bcName === bcName))
    const dispatch = useDispatch()

    return React.useCallback(
        (record: TreeAssociatedRecord, selected: boolean) => {
            const dataItem = {
                ...record,
                _associate: selected,
                _value: record[assocValueKey]
            }

            if (hierarchyRadioAll) {
                dispatch($do.dropAllAssociationsFull({ bcName, depth: record.level, dropDescendants: true }))
            } else if (hierarchyRootRadio && record.level === 1 && selected) {
                const rootSelectedRecord = selectedRecords.find(item => item.level === 1)
                if (rootSelectedRecord) {
                    dispatch(
                        $do.changeAssociationFull({
                            bcName,
                            depth: record.level,
                            widgetName: widget?.name,
                            dataItem: { ...rootSelectedRecord, _associate: false },
                            assocValueKey
                        })
                    )
                }
            }

            if ((!selected && hierarchyGroupDeselection) || (selected && hierarchyGroupSelection)) {
                dispatch(
                    $do.changeDescendantsAssociationsFull({
                        bcName,
                        parentId: record.id,
                        depth: record.level + 1,
                        assocValueKey,
                        selected
                    })
                )
            }
            dispatch(
                $do.changeAssociationFull({
                    bcName,
                    depth: record.level,
                    widgetName: widget?.name,
                    dataItem,
                    assocValueKey
                })
            )
        },
        [
            bcName,
            hierarchyGroupSelection,
            hierarchyGroupDeselection,
            hierarchyRadioAll,
            hierarchyRootRadio,
            selectedRecords,
            widget,
            assocValueKey,
            dispatch
        ]
    )
}
