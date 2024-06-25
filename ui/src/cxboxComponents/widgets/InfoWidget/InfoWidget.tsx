import React from 'react'
import { Row } from 'antd'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import InfoRow from './components/InfoRow'
import { RootState } from '@store'
import { useFlatFormFields } from '@hooks/useFlatFormFields'
import { actions, interfaces, RowMetaField } from '@cxbox-ui/core'
import { buildBcUrl } from '@utils/buildBcUrl'

interface InfoWidgetOwnProps {
    meta: interfaces.WidgetInfoMeta
    containerStyle?: string
}

interface InfoWidgetProps extends InfoWidgetOwnProps {
    cursor: string
    data: interfaces.DataItem
    fields?: interfaces.RowMetaField[]
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
}

/**
 *
 * @param props
 * @category Widgets
 */
const InfoWidget: React.FunctionComponent<InfoWidgetProps> = props => {
    const options = props.meta.options
    const hiddenKeys: string[] = []
    const flattenWidgetFields = useFlatFormFields<interfaces.WidgetInfoField>(props.meta.fields).filter(item => {
        if (!item.hidden) {
            return true
        } else {
            hiddenKeys.push(item.key)
            return false
        }
    })

    const InfoRows = options?.layout?.rows
        .filter(row => row.cols.find(col => !hiddenKeys.includes(col.fieldKey)))
        .map((row, index) => (
            <InfoRow
                key={index}
                meta={props.meta}
                data={props.data}
                flattenWidgetFields={flattenWidgetFields}
                fields={props.fields as RowMetaField[]}
                onDrillDown={props.onDrillDown}
                row={row}
                cursor={props.cursor}
                index={index}
            />
        ))

    return (
        <div className={props.containerStyle}>
            <Row>{InfoRows}</Row>
        </div>
    )
}

const emptyObject = {} as interfaces.DataItem

function mapStateToProps(state: RootState, ownProps: InfoWidgetOwnProps) {
    const bcName = ownProps.meta.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const bc = bcName ? state.screen.bo.bc[bcName] : undefined
    const bcCursor = bc?.cursor
    const bcData = state.data[bcName]
    return {
        fields: bcUrl ? state.view.rowMeta[bcName]?.[bcUrl]?.fields : undefined,
        data: bcData?.find(v => v.id === bcCursor) || emptyObject,
        cursor: bcCursor as string
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => {
            dispatch(actions.userDrillDown({ widgetName, cursor, bcName, fieldKey }))
        }
    }
}

InfoWidget.displayName = 'InfoWidget'
/**
 * @category Widgets
 */
const ConnectedInfoWidget = connect(mapStateToProps, mapDispatchToProps)(InfoWidget)

export default ConnectedInfoWidget
