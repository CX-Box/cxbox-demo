import React, { useCallback, useMemo } from 'react'
import { useDefaultAssociations } from './hooks/useDefaultAssociations'
import { actions, AssociatedItem } from '@cxbox-ui/core'
import { useDispatch } from 'react-redux'
import UiTitle, { TagType } from '@components/widgets/AssocListPopup/ui/Title'

const TAGS_LIMIT = 5

interface TitleProps {
    widgetName: string
    bcName: string
    title?: string
    assocValueKey: string | undefined
    tagsLimit?: number | null
}

function Title({ title, widgetName, bcName, assocValueKey = '', tagsLimit = TAGS_LIMIT }: TitleProps) {
    const { values: selectedRecords } = useDefaultAssociations(bcName)

    const tags = useMemo(() => {
        const visibleTags = assocValueKey
            ? (
                  selectedRecords.map((item: any) => ({
                      ...item,
                      _value: String(item[assocValueKey] || ''),
                      _closable: true
                  })) as TagType[]
              ).slice(0, tagsLimit ?? selectedRecords.length)
            : undefined

        const needTagWithCount = visibleTags && typeof tagsLimit === 'number' && selectedRecords.length > tagsLimit

        if (needTagWithCount) {
            const hiddenTagsCount = selectedRecords.length - tagsLimit
            visibleTags.push({ id: 'control', _associate: false, _value: `... ${hiddenTagsCount}` })
        }

        return visibleTags
    }, [assocValueKey, selectedRecords, tagsLimit])

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
        [dispatch, bcName, widgetName, assocValueKey]
    )

    return <UiTitle tags={tags} title={title} widgetName={widgetName} onClose={deleteTag} />
}

export default React.memo(Title)
