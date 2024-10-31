import React from 'react'
import styles from './InfoCell.less'
import { ActionLink, Field, MultiValueListRecord } from '@cxboxComponents'
import InfoValueWrapper from './InfoValueWrapper'
import { EMPTY_ARRAY } from '@constants'
import { useAppSelector } from '@store'
import { interfaces } from '@cxbox-ui/core'
import { AppWidgetInfoMeta, ETitleMode } from '@interfaces/widget'

const { FieldType } = interfaces

export interface ValueCellProps {
    row: interfaces.LayoutRow
    colSpan: number
    cursor: string
    meta: AppWidgetInfoMeta
    field: interfaces.WidgetInfoField
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
}
function InfoCell({ field, colSpan, row, meta, cursor, onDrillDown }: ValueCellProps) {
    const isMultiValue = field.type === FieldType.multivalue
    const data: interfaces.DataItem = useAppSelector(state => state.data[meta.bcName]?.find(i => i.id === cursor)) as interfaces.DataItem

    const dataId = data?.id
    const separateDrillDownTitle = field.drillDown && (field.drillDownTitle || (field.drillDownTitleKey && data[field.drillDownTitleKey]))
    const handleDrillDown = React.useCallback(() => {
        onDrillDown(meta.name, dataId, meta.bcName, field.key)
    }, [onDrillDown, meta, dataId, field.key])

    const ResultField = isMultiValue ? (
        ((data[field.key] || EMPTY_ARRAY) as interfaces.MultivalueSingleValue[]).map((multiValueSingleValue, index) => {
            return <MultiValueListRecord key={index} isFloat={false} multivalueSingleValue={multiValueSingleValue} />
        })
    ) : (
        <>
            {field.hintKey && data[field.hintKey] && <div className={styles.hint}>{data[field.hintKey]}</div>}
            <Field
                bcName={meta.bcName}
                cursor={cursor}
                widgetName={meta.name}
                widgetFieldMeta={field}
                disableDrillDown={!!separateDrillDownTitle}
                readonly
            />
            {separateDrillDownTitle && (
                <div>
                    <ActionLink onClick={handleDrillDown}>{separateDrillDownTitle}</ActionLink>
                </div>
            )}
        </>
    )

    return (
        <div
            data-test="FIELD"
            data-test-field-type={field.type}
            data-test-field-title={field.label || field.title}
            data-test-field-key={field.key}
        >
            <InfoValueWrapper key={field.key} row={row} colSpan={colSpan} titleMode={meta.options?.layout?.titleMode || ETitleMode.left}>
                {field.label?.length !== 0 && (
                    <div className={styles.labelArea}>
                        <span className={styles.label}>{field.label}</span>
                    </div>
                )}
                <div className={styles.fieldData}>{ResultField}</div>
            </InfoValueWrapper>
        </div>
    )
}

InfoCell.displayName = 'InfoCell'

export default React.memo(InfoCell)
