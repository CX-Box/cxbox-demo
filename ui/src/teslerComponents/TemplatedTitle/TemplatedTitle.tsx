import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Store } from '@interfaces/store'
import { getFieldTitle } from '@tesler-ui/core'

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

function mapStateToProps(store: Store, ownProps: TemplatedTitleOwnProps) {
    const widget = store.view.widgets.find(item => item.name === ownProps.widgetName)
    const bcName = widget?.bcName
    const bc = store.screen.bo.bc[bcName]
    const cursor = bc?.cursor
    const bcData = store.data[bcName]
    const dataItem = bcData?.find(item => item.id === cursor)
    return {
        templatedTitle: getFieldTitle(ownProps.title, dataItem)
    }
}
TemplatedTitle.displayName = 'TemplatedTitle'
/**
 * @category Components
 */
const ConnectedTemplatedTitle = connect(mapStateToProps)(TemplatedTitle)

export default ConnectedTemplatedTitle
