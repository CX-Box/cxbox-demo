import React from 'react'
import styles from './InfoCell.less'
import { LayoutRow, WidgetInfoMeta, WidgetInfoField } from '@cxbox-ui/core/interfaces/widget'
import { DataItem, MultivalueSingleValue } from '@cxbox-ui/core/interfaces/data'
import { FieldType } from '@cxbox-ui/core/interfaces/view'
import { ActionLink, Field, MultiValueListRecord } from '@cxbox-ui/core'
import InfoValueWrapper from './InfoValueWrapper'
import { EMPTY_ARRAY } from '../../../../constants/constants'
import { useSelector } from 'react-redux'
import { AppState } from '../../../../interfaces/storeSlices'

export interface ValueCellProps {
    row: LayoutRow
    colSpan: number
    cursor: string
    meta: WidgetInfoMeta
    field: WidgetInfoField
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
}
function InfoCell({ field, colSpan, row, meta, cursor, onDrillDown }: ValueCellProps) {
    const isMultiValue = field.type === FieldType.multivalue
    const data: DataItem = useSelector((state: AppState) => state.data[meta.bcName]?.find(i => i.id === cursor)) as DataItem

    const dataId = data?.id
    const separateDrillDownTitle = field.drillDown && (field.drillDownTitle || (field.drillDownTitleKey && data[field.drillDownTitleKey]))
    const handleDrillDown = React.useCallback(() => {
        onDrillDown(meta.name, dataId, meta.bcName, field.key)
    }, [onDrillDown, meta, dataId, field.key])

    const ResultField = isMultiValue ? (
        ((data[field.key] || EMPTY_ARRAY) as MultivalueSingleValue[]).map((multiValueSingleValue, index) => {
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
        <InfoValueWrapper key={field.key} row={row} colSpan={colSpan}>
            {field.label?.length !== 0 && (
                <div className={styles.labelArea}>
                    <span className={styles.label}>{field.label}</span>
                </div>
            )}
            <div className={styles.fieldData}>{ResultField}</div>
        </InfoValueWrapper>
    )
}

InfoCell.displayName = 'InfoCell'

export default React.memo(InfoCell)
