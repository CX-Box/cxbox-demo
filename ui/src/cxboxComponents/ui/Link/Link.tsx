import React, { FunctionComponent } from 'react'
// TODO править после добавления маршрутизации
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
        <a className={className} {...rest}>
            {props.children}
        </a>
    )
}

export default Link
