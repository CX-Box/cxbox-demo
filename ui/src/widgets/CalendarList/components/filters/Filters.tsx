import React from 'react'
import { selectBcMetaInProgress, selectWidget } from '@selectors/selectors'
import { useAppSelector } from '@store'
import { useRowMetaWithCache } from '@hooks/useRowMetaWithCache'
import { interfaces, WidgetListField } from '@cxbox-ui/core'
import ColumnTitle from '@components/ColumnTitle/ColumnTitle'
import { Spin } from 'antd'
import styles from './Filters.less'
import { isDefined } from '@utils/isDefined'
import { useTranslation } from 'react-i18next'
import { useFilterControlsWithLocked } from '@hooks/useFilterControlsWithLocked'
import ActionLink from '@components/ui/ActionLink/ActionLink'

interface FiltersProps {
    widgetName: string
    ignoreFieldNames?: string[]
}

const Filters: React.FC<FiltersProps> = ({ widgetName, ignoreFieldNames }) => {
    const widget = useAppSelector(selectWidget(widgetName))
    const metaInProgress = useAppSelector(selectBcMetaInProgress(widget?.bcName))
    const cachedRowMeta = useRowMetaWithCache(widget?.bcName, true)
    const { t } = useTranslation()
    const { appliedFiltersCount, showClearButton, clearAllFilters } = useFilterControlsWithLocked(widget?.bcName, ignoreFieldNames)

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
                {showClearButton && <ActionLink onClick={clearAllFilters}>{t('Clear filters', { count: appliedFiltersCount })}</ActionLink>}
            </div>
        </Spin>
    )
}

export default React.memo(Filters)
