import React, { useMemo } from 'react'
import cn from 'classnames'
import { Tooltip } from 'antd'
import { EMPTY_ARRAY, opacitySuffix } from '@constants'
import CoreDictionary, { DictionaryProps, getIconByParams } from '@cxboxComponents/ui/Dictionary/Dictionary'
import { useAppSelector } from '@store'
import { interfaces } from '@cxbox-ui/core'
import { buildBcUrl } from '@utils/buildBcUrl'
import DrillDown from '@components/ui/DrillDown/DrillDown'
import { AppDictionaryFieldMeta, EDictionaryMode } from '@interfaces/widget'
import styles from './Dictionary.module.css'

function Dictionary(props: DictionaryProps) {
    const { value, widgetName, backgroundColor, readOnly, onDrillDown } = props
    const meta = props.meta as AppDictionaryFieldMeta
    const bcName = useAppSelector(state => state.view.widgets?.find(i => i.name === widgetName)?.bcName)
    const bcUrl = bcName && buildBcUrl(bcName, true)
    const rowMeta = useAppSelector(state => bcName && bcUrl && state.view.rowMeta[bcName]?.[bcUrl])
    const rowFieldMeta = (rowMeta as interfaces.RowMeta)?.fields.find(field => field.key === meta?.key)

    const rowFieldMetaValues = useMemo(() => {
        return rowFieldMeta?.values?.map(valuesItem => ({
            ...valuesItem,
            icon: rowFieldMeta?.allValues?.find(allValuesItem => allValuesItem.value === valuesItem.value)?.icon
        }))
    }, [rowFieldMeta?.allValues, rowFieldMeta?.values])

    if (readOnly) {
        const iconParams = rowFieldMetaValues?.find(item => item.value === value)?.icon
        const icon = getIconByParams(iconParams)
        const valueComponent =
            meta.mode === EDictionaryMode.icon ? (
                <Tooltip className={styles.iconTooltip} title={value} placement="top">
                    {icon}
                </Tooltip>
            ) : (
                <span>
                    {icon} {value}
                </span>
            )

        return (
            <div
                className={cn(styles.coloredValue, props.className)}
                style={backgroundColor ? { color: backgroundColor, backgroundColor: `${backgroundColor}${opacitySuffix}` } : undefined}
            >
                {onDrillDown ? (
                    <DrillDown
                        displayedValue={valueComponent}
                        meta={meta}
                        widgetName={widgetName}
                        cursor={props.cursor}
                        onDrillDown={onDrillDown}
                    />
                ) : (
                    valueComponent
                )}
            </div>
        )
    }

    return (
        <CoreDictionary
            {...props}
            values={
                (rowFieldMeta ? rowFieldMetaValues : EMPTY_ARRAY) as Array<{
                    value: string
                    icon?: string
                }>
            }
        />
    )
}

export default React.memo(Dictionary)
