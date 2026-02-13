import { useMemo } from 'react'
import { getExtension, isAudioExtension } from '@utils/fileViewer'
import { useAppSelector } from '@store'
import { selectWidget } from '@selectors/selectors'
import { useInternalWidget } from '@hooks/useInternalWidget'
import { useGetFieldValue } from '@hooks/useGetFieldValue'

export const CUSTOM_VIEW_BUTTON_KEY = '_custom-view-button'

export function useCustomViewOperation(widgetName: string, fieldKey: string, id: string | null) {
    const widget = useAppSelector(selectWidget(widgetName))
    const { internalWidget } = useInternalWidget(widget, 'popup')

    const getValue = useGetFieldValue(widget?.bcName, id)

    const fileName = getValue(fieldKey) as string | undefined

    const isEdit = !!internalWidget

    const extension = useMemo(() => getExtension(fileName), [fileName])

    return useMemo(() => {
        const icon = isEdit ? 'edit' : extension && isAudioExtension(extension) ? 'customer-service' : 'eye'

        return {
            type: CUSTOM_VIEW_BUTTON_KEY,
            icon
        }
    }, [extension, isEdit])
}
