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
    const { route, dispatch, time, icon, iconColor, drillDownLink = '', drillDownType, drillDownLabel, className, ...rest } = props
    let key = `open${Date.now()}`
    let btnOptions: ButtonProps = {
        type: 'link'
    }
    if (drillDownType === 'downloadFile') {
        btnOptions = {
            ...btnOptions,
            target: '_blank',
            href: CxBoxApiInstance.getMessageDownloadFileEndpoint(drillDownLink),
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
                dispatch(actions.drillDown({ url: drillDownLink, drillDownType: drillDownType as interfaces.DrillDownType, route }))
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
