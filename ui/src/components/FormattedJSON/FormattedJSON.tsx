import React from 'react'

interface FormattedJSONProps {
    json: Record<string, unknown>
}

const FormattedJSON: React.FunctionComponent<FormattedJSONProps> = props => {
    const { json } = props
    return (
        <pre>
            <code style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(json, null, 2)}</code>
        </pre>
    )
}

export default React.memo(FormattedJSON)
