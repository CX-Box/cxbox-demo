import React from 'react'
import cn from 'classnames'
import { interfaces } from '@cxbox-ui/core'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@store'
import { actions } from '@cxbox-ui/core'
import InfoRow from './components/InfoRow'
import { Row } from 'antd'
import { useFlatFormFields } from '@hooks/useFlatFormFields'
import { AppWidgetInfoMeta } from '@interfaces/widget'
import styles from './Info.less'

interface InfoProps {
    meta: AppWidgetInfoMeta
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
    const dispatch = useDispatch()
    const handleDrillDown = React.useCallback(
        (dataId: string, fieldKey: string) => {
            dispatch(actions.userDrillDown({ widgetName: name, cursor: dataId, bcName, fieldKey }))
        },
        [dispatch, name, bcName]
    )

    const flattenWidgetFields = useFlatFormFields<interfaces.WidgetInfoField>(meta.fields).filter(item => {
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

    return <Row className={cn({ [styles.margin]: meta.options?.layout?.titleMode })}>{InfoRows}</Row>
}

export default React.memo(Info)
