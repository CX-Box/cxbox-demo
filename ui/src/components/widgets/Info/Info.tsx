import React from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@store'
import { actions } from '@cxbox-ui/core'
import InfoRow from './components/InfoRow'
import { Row } from 'antd'
import { AppWidgetInfoMeta } from '@interfaces/widget'
import styles from './Info.module.less'
import { useProportionalWidgetGrid } from '@hooks/widgetGrid'

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
    const { bcName, name: widgetName } = meta
    const cursor = useAppSelector(state => state.screen.bo.bc[bcName]?.cursor || '')

    const dispatch = useDispatch()

    const handleDrillDown = React.useCallback(
        (dataId: string, fieldKey: string) => {
            dispatch(actions.userDrillDown({ widgetName, cursor: dataId, bcName, fieldKey }))
        },
        [dispatch, widgetName, bcName]
    )

    const { grid, visibleFlattenWidgetFields } = useProportionalWidgetGrid(meta)

    return (
        <Row className={styles.container}>
            {grid?.map((row, index) => (
                <InfoRow
                    key={index}
                    meta={meta}
                    flattenWidgetFields={visibleFlattenWidgetFields}
                    onDrillDown={handleDrillDown}
                    row={row}
                    cursor={cursor}
                />
            ))}
        </Row>
    )
}

export default React.memo(Info)
