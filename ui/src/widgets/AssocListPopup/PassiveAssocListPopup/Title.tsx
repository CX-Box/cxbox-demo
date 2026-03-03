import React from 'react'
import { usePassiveAssociations } from './hooks/usePassiveAssociations'
import UiTitle, { TagType } from '../ui/Title'

interface TitleProps {
    widgetName: string
    title?: string
    assocValueKey: string | undefined
}

function Title({ title, widgetName, assocValueKey }: TitleProps) {
    const { values: selectedRecords, selectItem } = usePassiveAssociations()

    const tags = assocValueKey
        ? (selectedRecords.map((item: any) => ({
              ...item,
              _value: String(item.value || ''),
              _closable: true
          })) as TagType[])
        : undefined

    const deleteTag = (value: TagType) => {
        selectItem(value, false)
    }

    return <UiTitle tags={tags} title={title} widgetName={widgetName} onClose={deleteTag} />
}

export default React.memo(Title)
