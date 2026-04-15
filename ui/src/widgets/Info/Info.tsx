import React from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@store'
import { actions } from '@cxbox-ui/core'
import InfoRow from './components/InfoRow'
import { Row } from 'antd'
import { AppWidgetInfoMeta } from '@interfaces/widget'
import styles from './Info.less'
import { useProportionalWidgetGrid } from '@hooks/widgetGrid'
import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import Card from '@components/Card/Card'
import WidgetLoader from '@components/WidgetLoader'

function assertIsInfoMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is AppWidgetInfoMeta {
    if (meta.type !== 'Info') {
        throw new Error('Not a Info meta')
    }
}

/**
 * Displays data as flat table
 *
 */
const Info: WidgetComponentType = ({ widgetMeta, mode }) => {
    assertIsInfoMeta(widgetMeta)
    const { bcName, name: widgetName } = widgetMeta
    const cursor = useAppSelector(state => state.screen.bo.bc[bcName]?.cursor || '')

    const dispatch = useDispatch()

    const handleDrillDown = React.useCallback(
        (dataId: string, fieldKey: string) => {
            dispatch(actions.userDrillDown({ widgetName, cursor: dataId, bcName, fieldKey }))
        },
        [dispatch, widgetName, bcName]
    )

    const { grid, visibleFlattenWidgetFields } = useProportionalWidgetGrid(widgetMeta)

    return (
        <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
            <Card widgetMeta={widgetMeta} mode={mode}>
                <Row className={styles.container}>
                    {grid?.map((row, index) => (
                        <InfoRow
                            key={index}
                            meta={widgetMeta}
                            flattenWidgetFields={visibleFlattenWidgetFields}
                            onDrillDown={handleDrillDown}
                            row={row}
                            cursor={cursor}
                        />
                    ))}
                </Row>
            </Card>
        </WidgetLoader>
    )
}

export default React.memo(Info)
