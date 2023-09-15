import React from 'react'
import { WidgetInfoMeta, WidgetInfoField } from '@cxbox-ui/core/interfaces/widget'
// import { useFlatFormFields } from '@cxbox-ui/core
import InfoRow from './components/InfoRow'
import { Row } from 'antd'
import { useAppDispatch, useAppSelector } from '../../../store'
import { userDrillDown } from '@cxbox-ui/core/actions'

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
    const cursor = useAppSelector(state => state.screen.bo.bc[bcName]?.cursor || '')
    const dispatch = useAppDispatch()
    const handleDrillDown = React.useCallback(
        (dataId: string, fieldKey: string) => {
            dispatch(userDrillDown({ widgetName: name, cursor: dataId, bcName, fieldKey }))
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
