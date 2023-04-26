import React from 'react'
import { DictionaryProps } from '@cxbox-ui/core/components/ui/Dictionary/Dictionary'
import { useSelector } from 'react-redux'
import { AppState } from '../../interfaces/storeSlices'
import { buildBcUrl } from '@cxbox-ui/core'
import styles from './Dictionary.module.css'
import { RowMeta } from '@cxbox-ui/core/interfaces/rowMeta'
import { EMPTY_ARRAY, opacitySuffix } from '../../constants/constants'
import { Dictionary as CoreDictionary } from '@cxbox-ui/core'

function Dictionary(props: DictionaryProps) {
    const { value, meta, widgetName, backgroundColor } = props
    const bcName = useSelector((state: AppState) => state.view.widgets?.find(i => i.name === widgetName)?.bcName)
    const bcUrl = bcName && buildBcUrl(bcName, true)
    const rowMeta = useSelector((state: AppState) => bcName && bcUrl && state.view.rowMeta[bcName]?.[bcUrl])
    const rowFieldMeta = (rowMeta as RowMeta)?.fields.find(field => field.key === meta?.key)
    if (meta?.bgColorKey) {
        return (
            <div
                className={styles.coloredValue}
                style={backgroundColor ? { color: backgroundColor, backgroundColor: `${backgroundColor}${opacitySuffix}` } : undefined}
            >
                {value}
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
