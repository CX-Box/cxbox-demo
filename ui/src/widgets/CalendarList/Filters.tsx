import React from 'react'
import { selectBcMetaInProgress, selectWidget } from '@selectors/selectors'
import { useAppSelector } from '@store'
import { useRowMetaWithCache } from '@hooks/useRowMetaWithCache'
import { interfaces, WidgetListField } from '@cxbox-ui/core'
import ColumnTitle from '@components/ColumnTitle/ColumnTitle'
import { Spin } from 'antd'
import styles from './Filters.less'
import { isDefined } from '@utils/isDefined'

interface FiltersProps {
    widgetName: string
    ignoreFieldNames?: string[]
}

const Filters: React.FC<FiltersProps> = ({ widgetName, ignoreFieldNames }) => {
    const widget = useAppSelector(selectWidget(widgetName))
    const metaInProgress = useAppSelector(selectBcMetaInProgress(widget?.bcName))
    const cachedRowMeta = useRowMetaWithCache(widget?.bcName, true)

    return (
        <Spin spinning={metaInProgress}>
            <div className={styles.container}>
                {(widget?.fields as WidgetListField[] | undefined)
                    ?.map(widgetField => {
                        const fieldRowMeta = cachedRowMeta?.fields?.find(
                            rowMetaField => rowMetaField.key === widgetField.key && !ignoreFieldNames?.includes(widgetField.key)
                        )

                        if (fieldRowMeta?.filterable) {
                            return (
                                <ColumnTitle
                                    key={widgetField.key}
                                    className={styles.title}
                                    showCloseButton={false}
                                    widgetName={widgetName}
                                    widgetMeta={widgetField}
                                    rowMeta={fieldRowMeta as interfaces.RowMetaField}
                                    disableSort={true}
                                />
                            )
                        }

                        return null
                    })
                    .filter(isDefined)}
            </div>
        </Spin>
    )
}

export default React.memo(Filters)
