import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { Store } from '@interfaces/store'
import styles from './CheckboxPicker.less'
import { ChangeDataItemPayload } from '@teslerComponents/Field/Field'
import { DataValue } from '@tesler-ui/schema'
import { RowMetaField } from '@tesler-ui/core'
import { PendingDataItem } from '@tesler-ui/core'
import { buildBcUrl } from '@tesler-ui/core'
import { $do } from '@actions/types'

export interface CheckboxPickerOwnProps {
    fieldName: string
    fieldLabel: string
    bcName: string
    cursor: string
    readonly?: boolean
    value: DataValue
}

interface CheckboxPickerProps extends CheckboxPickerOwnProps {
    metaField: RowMetaField
    onChange: (payload: ChangeDataItemPayload) => void
}

/**
 *
 * @param props
 * @category Components
 */
const CheckboxPicker: React.FC<CheckboxPickerProps> = ({ metaField, bcName, cursor, fieldName, fieldLabel, value, readonly, onChange }) => {
    const handleChange = React.useCallback(
        (event: CheckboxChangeEvent) => {
            const dataItem: PendingDataItem = { [fieldName]: event.target.checked }
            const payload: ChangeDataItemPayload = {
                bcName,
                cursor,
                dataItem
            }
            onChange(payload)
        },
        [onChange, bcName, cursor, fieldName]
    )

    return (
        <div className={styles.container}>
            {
                <Checkbox checked={value as boolean} disabled={metaField?.disabled || readonly} onChange={handleChange}>
                    {fieldLabel}
                </Checkbox>
            }
        </div>
    )
}

function mapStateToProps(store: Store, ownProps: CheckboxPickerOwnProps) {
    const bcUrl = buildBcUrl(ownProps.bcName, true)
    const metaField = bcUrl && store.view.rowMeta[ownProps.bcName]?.[bcUrl]?.fields?.find(field => field.key === ownProps.fieldName)
    return {
        metaField
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onChange: (payload: ChangeDataItemPayload) => {
            dispatch($do.changeDataItem(payload))
        }
    }
}

/**
 * @category Components
 */
export const ConnectedCheckboxPicker = connect(mapStateToProps, mapDispatchToProps)(CheckboxPicker)

export default ConnectedCheckboxPicker
