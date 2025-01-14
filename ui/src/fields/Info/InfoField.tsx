import { DataItem } from '@cxbox-ui/core'
import { WidgetField } from '@cxbox-ui/schema'
import { RootState } from '@store'
import React from 'react'
import styles from '../Info/InfoField.less'
import { connect } from 'react-redux'

interface InfoFieldProps {
    values: DataItem[]
    meta: WidgetField
    widgetName: string
    cursor: string
}

const InfoField: React.FunctionComponent<InfoFieldProps> = props => {
    const { meta, values, cursor } = props
    const value = values.find(item => item.id === cursor) as DataItem

    return (
        <div>
            <p className={styles.multiline}>{value[meta.key]}</p>
        </div>
    )
}

export function mapStateToProps(state: RootState, ownProps: InfoFieldProps) {
    const widget = state.view.widgets.find(item => item.name === ownProps.widgetName)
    const bcName = widget?.bcName as string
    const bcData = state.data[bcName]
    return {
        values: bcData
    }
}

export default connect(mapStateToProps)(InfoField)
