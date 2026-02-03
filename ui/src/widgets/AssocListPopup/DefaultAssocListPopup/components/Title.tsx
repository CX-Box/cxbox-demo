import React, { useMemo } from 'react'
import { DataItem } from '@cxbox-ui/core'
import UiTitle, { TagType } from '@components/widgets/AssocListPopup/ui/Title'

const TAGS_LIMIT = 5

interface TitleProps {
    widgetName: string
    title?: string
    assocValueKey: string | undefined
    tagsLimit?: number | null
    selectedRecords: DataItem[]
    onDelete: (value: TagType) => void
}

function Title({ title, widgetName, assocValueKey = '', tagsLimit = TAGS_LIMIT, selectedRecords, onDelete }: TitleProps) {
    const tags = useMemo(() => {
        const visibleTags = assocValueKey
            ? (
                  selectedRecords.map(item => ({
                      ...item,
                      _value: String(item[assocValueKey] || item.id || ''),
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

    return <UiTitle tags={tags} title={title} widgetName={widgetName} onClose={onDelete} />
}

export default React.memo(Title)
