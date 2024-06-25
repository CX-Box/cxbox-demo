import React from 'react'
import { EMPTY_ARRAY, opacitySuffix } from '@constants'
import styles from './Dictionary.module.css'
import CoreDictionary, { DictionaryProps } from '@cxboxComponents/ui/Dictionary/Dictionary'
import { useAppSelector } from '@store'
import { interfaces } from '@cxbox-ui/core'
import { buildBcUrl } from '@utils/buildBcUrl'
import ActionLink from '@cxboxComponents/ui/ActionLink/ActionLink'
import cn from 'classnames'

function Dictionary(props: DictionaryProps) {
    const { value, meta, widgetName, backgroundColor, readOnly, onDrillDown } = props
    const bcName = useAppSelector(state => state.view.widgets?.find(i => i.name === widgetName)?.bcName)
    const bcUrl = bcName && buildBcUrl(bcName, true)
    const rowMeta = useAppSelector(state => bcName && bcUrl && state.view.rowMeta[bcName]?.[bcUrl])
    const rowFieldMeta = (rowMeta as interfaces.RowMeta)?.fields.find(field => field.key === meta?.key)

    if (readOnly) {
        return (
            <div
                className={cn(styles.coloredValue, props.className)}
                style={backgroundColor ? { color: backgroundColor, backgroundColor: `${backgroundColor}${opacitySuffix}` } : undefined}
            >
                {onDrillDown ? <ActionLink onClick={onDrillDown}>{value}</ActionLink> : value}
            </div>
        )
    }

    return (
        <CoreDictionary
            {...props}
            values={
                (rowFieldMeta ? rowFieldMeta.values : EMPTY_ARRAY) as Array<{
                    value: string
                    icon: string
                }>
            }
        />
    )
}

export default React.memo(Dictionary)
