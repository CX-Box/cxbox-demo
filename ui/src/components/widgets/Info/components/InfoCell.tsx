import React, { useCallback } from 'react'
import Field from '@components/Field/Field'
import DrillDown from '@components/ui/DrillDown/DrillDown'
import InfoValueWrapper from './InfoValueWrapper'
import { useAppSelector } from '@store'
import { interfaces } from '@cxbox-ui/core'
import { AppWidgetInfoMeta, ETitleMode } from '@interfaces/widget'
import styles from './InfoCell.less'

export interface ValueCellProps {
    row: interfaces.LayoutRow
    colSpan: number
    cursor: string
    meta: AppWidgetInfoMeta
    field: interfaces.WidgetInfoField
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
}
function InfoCell({ field, colSpan, row, meta, cursor, onDrillDown }: ValueCellProps) {
    const data: interfaces.DataItem = useAppSelector(state => state.data[meta.bcName]?.find(i => i.id === cursor)) as interfaces.DataItem

    const dataId = data?.id
    const separateDrillDownTitle = field.drillDown && (field.drillDownTitle || (field.drillDownTitleKey && data[field.drillDownTitleKey]))
    const handleDrillDown = useCallback(() => {
        onDrillDown(meta.name, dataId, meta.bcName, field.key)
    }, [onDrillDown, meta, dataId, field.key])

    return (
        <InfoValueWrapper
            key={field.key}
            row={row}
            colSpan={colSpan}
            titleMode={meta.options?.layout?.titleMode || ETitleMode.left}
            data-test="FIELD"
            data-test-field-type={field.type}
            data-test-field-title={field.label || field.title}
            data-test-field-key={field.key}
        >
            {field.label?.length !== 0 && (
                <div className={styles.labelArea}>
                    <span className={styles.label}>{field.label}</span>
                </div>
            )}

            <div className={styles.fieldData}>
                <span>
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
                        <DrillDown
                            displayedValue={separateDrillDownTitle}
                            meta={field}
                            widgetName={meta.name}
                            cursor={cursor}
                            onDrillDown={handleDrillDown}
                        />
                    )}
                </span>
            </div>
        </InfoValueWrapper>
    )
}

InfoCell.displayName = 'InfoCell'

export default React.memo(InfoCell)
