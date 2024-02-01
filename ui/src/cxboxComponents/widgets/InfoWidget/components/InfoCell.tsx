import React from 'react'
import TemplatedTitle from '@cxboxComponents/TemplatedTitle/TemplatedTitle'
import cn from 'classnames'
import styles from './InfoCell.less'
import Field from '@cxboxComponents/Field/Field'
import ActionLink from '@cxboxComponents/ui/ActionLink/ActionLink'
import InfoValueWrapper from './InfoValueWrapper'
import MultiValueListRecord from '@cxboxComponents/Multivalue/MultiValueListRecord'
import { interfaces } from '@cxbox-ui/core'

const { FieldType } = interfaces

export interface ValueCellProps {
    row: interfaces.LayoutRow
    col: interfaces.LayoutCol
    cursor: string
    meta: interfaces.WidgetInfoMeta
    data: interfaces.DataItem
    flattenWidgetFields: interfaces.WidgetInfoField[]
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
}
const emptyMultivalueField = [] as interfaces.MultivalueSingleValue[]
export const InfoCell: React.FunctionComponent<ValueCellProps> = ({ flattenWidgetFields, col, row, data, meta, cursor, onDrillDown }) => {
    const field = flattenWidgetFields.find(item => item.key === col.fieldKey) as interfaces.WidgetInfoField
    const isMultiValue = field.type === FieldType.multivalue
    const dataId = data.id
    const separateDrillDownTitle = field.drillDown && (field.drillDownTitle || (field.drillDownTitleKey && data[field.drillDownTitleKey]))
    const handleDrillDown = React.useCallback(() => {
        onDrillDown(meta.name, dataId, meta.bcName, field.key)
    }, [onDrillDown, meta, dataId, field.key])

    const ResultField = isMultiValue ? (
        ((data[field.key] || emptyMultivalueField) as interfaces.MultivalueSingleValue[]).map((multiValueSingleValue, index) => {
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
                className={cn({ [styles.infoWidgetValue]: !!field.bgColorKey })}
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
            <InfoValueWrapper key={field.key} row={row} col={col}>
                {field.label?.length !== 0 && (
                    <div className={styles.labelArea}>
                        <TemplatedTitle widgetName={meta.name} title={field.label} />
                    </div>
                )}
                <div className={styles.fieldData}>{ResultField}</div>
            </InfoValueWrapper>
        </div>
    )
}

InfoCell.displayName = 'InfoCell'

export default React.memo(InfoCell)
