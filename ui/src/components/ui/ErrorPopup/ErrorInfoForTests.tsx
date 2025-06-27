import React from 'react'
import { interfaces } from '@cxbox-ui/core'

const { ApplicationErrorType } = interfaces

interface ErrorInfoForTestsProps {
    error?: interfaces.SystemError
}

/**
 * Needed to display a system error in an html file from the log during testing.
 * @param error
 * @constructor
 */
function ErrorInfoForTests({ error }: ErrorInfoForTestsProps) {
    if (!error || error.type !== ApplicationErrorType.SystemError) {
        return null
    }

    return (
        <div data-title="error-info" style={{ display: 'none' }}>
            <div>{error.details}</div>
            {error?.error && <div>{JSON.stringify(error.error.response, undefined, 2)}</div>}
        </div>
    )
}

export default ErrorInfoForTests
