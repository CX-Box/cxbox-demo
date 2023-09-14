import React from 'react'
import highlightJson from '../../../utils/highlightJson'

interface FormattedJSONProps {
    json: Record<string, unknown>
}
const FormattedJSON: React.FunctionComponent<FormattedJSONProps> = props => {
    const { json } = props
    return (
        <pre>
            <code dangerouslySetInnerHTML={{ __html: highlightJson(json) }} />
        </pre>
    )
}

const MemoizedFormattedJSON = React.memo(FormattedJSON)
export default MemoizedFormattedJSON
