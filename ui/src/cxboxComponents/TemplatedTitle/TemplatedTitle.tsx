import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { RootState } from '@store'
import { utils } from '@cxbox-ui/core'

interface TemplatedTitleOwnProps {
    title: string
    widgetName: string
    container?: React.ComponentType<any>
}

interface TemplatedTitleProps extends TemplatedTitleOwnProps {
    templatedTitle: string
}

/**
 *
 * @param props
 * @category Components
 */
export const TemplatedTitle: FunctionComponent<TemplatedTitleProps> = props => {
    if (!props.title) {
        return null
    }
    const wrapper = props.container && <props.container title={props.templatedTitle} />
    return wrapper || <> {props.templatedTitle} </>
}

function mapStateToProps(state: RootState, ownProps: TemplatedTitleOwnProps) {
    const widget = state.view.widgets.find(item => item.name === ownProps.widgetName)
    const bcName = widget?.bcName || ''
    const bc = bcName ? state.screen.bo.bc[bcName] : undefined
    const cursor = bc?.cursor
    const bcData = state.data[bcName]
    const dataItem = bcData?.find(item => item.id === cursor)
    return {
        templatedTitle: utils.getFieldTitle(ownProps.title, dataItem)
    }
}
TemplatedTitle.displayName = 'TemplatedTitle'
/**
 * @category Components
 */
const ConnectedTemplatedTitle = connect(mapStateToProps)(TemplatedTitle)

export default ConnectedTemplatedTitle
