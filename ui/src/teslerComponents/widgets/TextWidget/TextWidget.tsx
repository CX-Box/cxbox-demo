import React from 'react'
import styles from './TextWidget.less'
import marked from 'marked'
import parse from 'html-react-parser'
import WidgetErrorBoundary from '@teslerComponents/WidgetErrorBoundary/WidgetErrorBoundary'
import { WidgetTextMeta } from '@tesler-ui/core'

interface TextWidgetOwnProps {
    meta: WidgetTextMeta
}

/**
 *
 * @param props
 * @category Widgets
 */
const TextWidget: React.FunctionComponent<TextWidgetOwnProps> = props => {
    const description = props.meta.description
    const htmlText = parse(marked(description))
    return (
        <WidgetErrorBoundary msg={<p className={styles.errorMessage}>Invalid text</p>}>
            <div className={styles.textWidget}>{htmlText}</div>
        </WidgetErrorBoundary>
    )
}

/**
 * @category Widgets
 */
export default TextWidget
