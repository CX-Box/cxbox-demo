import React from 'react'
import { WidgetInfoMeta, WidgetInfoField } from '@cxbox-ui/core/interfaces/widget'
import { useFlatFormFields } from '@cxbox-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../../interfaces/storeSlices'
import { $do } from '../../../actions/types'
import InfoRow from './components/InfoRow'
import { Row } from 'antd'

interface InfoProps {
    meta: WidgetInfoMeta
}

/**
 * Displays data as flat table
 *
 * @param meta
 * @constructor
 */
function Info({ meta }: InfoProps) {
    const { bcName, name, options } = meta
    const cursor = useSelector((state: AppState) => state.screen.bo.bc[bcName]?.cursor || '')
    const dispatch = useDispatch()
    const handleDrillDown = React.useCallback(
        (dataId: string, fieldKey: string) => {
            dispatch($do.userDrillDown({ widgetName: name, cursor: dataId, bcName, fieldKey }))
        },
        [dispatch, name, bcName]
    )

    const flattenWidgetFields = useFlatFormFields<WidgetInfoField>(meta.fields).filter(item => {
        return !item.hidden
    })

    const InfoRows = options?.layout?.rows
        .filter(row => row.cols.find(col => flattenWidgetFields.some(i => i.key === col.fieldKey)))
        .map((row, index) => (
            <InfoRow
                key={index}
                meta={meta}
                flattenWidgetFields={flattenWidgetFields}
                onDrillDown={handleDrillDown}
                row={row}
                cursor={cursor}
            />
        ))

    return <Row>{InfoRows}</Row>
}

export default React.memo(Info)
