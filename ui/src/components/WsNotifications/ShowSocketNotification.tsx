import React from 'react'
import { Button, Icon, notification } from 'antd'
import { ArgsProps } from 'antd/lib/notification'
import cn from 'classnames'
import { ButtonProps } from 'antd/lib/button'
import { Dispatch } from 'redux'
import styles from './ShowSocketNotification.less'
import { SocketNotification } from '@interfaces/notification'
import { actions, interfaces } from '@cxbox-ui/core'
import { CxBoxApiInstance } from '../../api'

interface NotificationProps extends Omit<ArgsProps, 'icon'>, SocketNotification {
    route: interfaces.Route
    dispatch: Dispatch
}

function showSocketNotification(props: NotificationProps) {
    const { route, dispatch, time, icon, iconColor, links, className, ...rest } = props
    const drilldown = links?.[0]
    let key = `open${Date.now()}`
    let btnOptions: ButtonProps = {
        type: 'link'
    }

    if (drilldown?.drillDownType.toString() === 'downloadFile') {
        btnOptions = {
            ...btnOptions,
            target: '_blank',
            href: CxBoxApiInstance.getMessageDownloadFileEndpoint(drilldown.drillDownLink),
            onClick: () => {
                notification.destroy()
            }
        }
        notification.close('infoNotification')
    } else {
        key = 'infoNotification'
        btnOptions = {
            ...btnOptions,
            onClick: () => {
                if (drilldown) {
                    dispatch(actions.drillDown({ url: drilldown.drillDownLink, drillDownType: drilldown.drillDownType, route }))
                }
                // notification.close(key) // uncomment if needed
            }
        }
    }
    return notification.open({
        key,
        className: cn(styles.notification, className),
        duration: 0,
        btn: drilldown ? (
            <span>
                <Button {...btnOptions}>{drilldown.drillDownLabel}</Button>
                {links?.length > 1 ? `and ${links.length - 1} more...` : null}
            </span>
        ) : null,
        icon: icon ? <Icon type={icon} style={{ color: iconColor }} /> : null,
        ...rest
    })
}

export default showSocketNotification
