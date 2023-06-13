import React, { FunctionComponent } from 'react'
import { createLocation } from 'history'
import { historyObj } from '@cxbox-ui/core'

export interface LinkProps {
    children: React.ReactNode
    className: string
    href: string
}

/**
 *
 * @param props
 * @category Components
 */
export const Link: FunctionComponent<LinkProps> = props => {
    const { className, href, ...rest } = props
    return (
        <a className={className} href={historyObj.createHref(createLocation(href))} {...rest}>
            {props.children}
        </a>
    )
}

export default Link
