import React from 'react'
import { Button, Icon, notification } from 'antd'
import { ArgsProps } from 'antd/lib/notification'
import { DrillDownType, Route } from '@cxbox-ui/core/interfaces/router'
import cn from 'classnames'
import { ButtonProps } from 'antd/lib/button'
import { Dispatch } from 'redux'
import styles from './ShowSocketNotification.less'
import { SocketNotification } from '../../interfaces/notification'
import { getMessageDownloadFileEndpoint } from '../../api/notification'
import { $do } from '@cxbox-ui/core'

interface NotificationProps extends Omit<ArgsProps, 'icon'>, SocketNotification {
    route: Route
    dispatch: Dispatch
}
function showSocketNotification(props: NotificationProps) {
    const { route, dispatch, time, icon, iconColor, drillDownLink = '', drillDownType, drillDownLabel, className, ...rest } = props
    let key = `open${Date.now()}`
    let btnOptions: ButtonProps = {
        type: 'link'
    }
    if (drillDownType === 'downloadFile') {
        btnOptions = {
            ...btnOptions,
            target: '_blank',
            href: getMessageDownloadFileEndpoint(drillDownLink),
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
                dispatch($do.drillDown({ url: drillDownLink, drillDownType: drillDownType as DrillDownType, route }))
                // notification.close(key) // uncomment if needed
            }
        }
    }
    return notification.open({
        key,
        className: cn(styles.notification, className),
        duration: 0,
        btn: <Button {...btnOptions}>{drillDownLabel}</Button>,
        icon: icon ? <Icon type={icon} style={{ color: iconColor }} /> : null,
        ...rest
    })
}

export default showSocketNotification
