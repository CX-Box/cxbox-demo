import React from 'react'
import cn from 'classnames'
import styles from './CardList.less'
import { AppWidgetMeta, FileUploadFieldMeta } from '@interfaces/widget'
import { Empty } from 'antd'
import { DataItem, FieldType } from '@cxbox-ui/schema'
import { useAppSelector } from '@store'
import { useTranslation } from 'react-i18next'
import Pagination from '@components/ui/Pagination/Pagination'
import Field from '@components/Field/Field'
import { PREVIEW_WIDTH_DEFAULT } from '@constants/fileViewer'

interface CardListProps {
    meta: AppWidgetMeta
}

const emptyData: DataItem[] = []

function CardList({ meta }: CardListProps) {
    const { t } = useTranslation()
    const { bcName, name: widgetName } = meta
    const data = useAppSelector(state => state.data[bcName] ?? emptyData) as DataItem[]
    const widgetField = (meta?.fields as FileUploadFieldMeta[])?.find(field => field.type === FieldType.fileUpload)

    return (
        <div className={cn(styles.root)}>
            <div className={cn(styles.previewGroup)}>
                {data.length > 0 ? (
                    data.map((dataItem, index) => {
                        const size = widgetField?.width ?? PREVIEW_WIDTH_DEFAULT

                        return widgetField ? (
                            <div key={dataItem.id} className={styles.card}>
                                <Field
                                    data={dataItem as DataItem}
                                    bcName={bcName}
                                    cursor={dataItem.id}
                                    widgetName={widgetName}
                                    widgetFieldMeta={widgetField}
                                    readonly={true}
                                />
                                <div style={{ width: size, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {dataItem[widgetField.key]}
                                </div>
                            </div>
                        ) : null
                    })
                ) : (
                    <div className={styles.empty}>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('No data')} />
                    </div>
                )}
            </div>
            <Pagination meta={meta} />
        </div>
    )
}

export default React.memo(CardList)
