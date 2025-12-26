import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import Title from './Title'
import { useDefaultAssociations } from '../hooks/useDefaultAssociations'
import { actions, AssociatedItem } from '@cxbox-ui/core'
import { TagType } from '@components/widgets/AssocListPopup/ui/Title'

interface AssocTitleProps {
    widgetName: string
    bcName: string
    assocValueKey: string | undefined
    title?: string
}

function AssocTitle({ title, widgetName, bcName, assocValueKey }: AssocTitleProps) {
    const { values: selectedRecords } = useDefaultAssociations(bcName)

    const dispatch = useDispatch()

    const deleteTag = useCallback(
        (value: TagType) => {
            dispatch(
                actions.changeAssociationFull({
                    bcName,
                    depth: value.level as number,
                    widgetName,
                    dataItem: { ...value, _associate: false } as unknown as AssociatedItem,
                    assocValueKey
                })
            )
        },
        [assocValueKey, bcName, dispatch, widgetName]
    )

    return (
        <Title title={title} widgetName={widgetName} assocValueKey={assocValueKey} selectedRecords={selectedRecords} onDelete={deleteTag} />
    )
}

export default React.memo(AssocTitle)
