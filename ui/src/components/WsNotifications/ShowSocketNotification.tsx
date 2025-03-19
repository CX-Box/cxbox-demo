import React from 'react'
import { Button, Icon } from 'antd'
import { t } from 'i18next'
import { ArgsProps } from 'antd/lib/notification'
import cn from 'classnames'
import { ButtonProps } from 'antd/lib/button'
import { Dispatch } from 'redux'
import SocketNotificationDrillDown from './SocketNotificationDrillDown'
import { closeNotification, openBusinessNotification } from '@components/NotificationsContainer/utils'
import { actions, interfaces } from '@cxbox-ui/core'
import { CxBoxApiInstance } from '../../api'
import { SocketNotification } from '@interfaces/notification'
import styles from './ShowSocketNotification.less'

interface NotificationProps extends Omit<ArgsProps, 'icon'>, SocketNotification {
    route: interfaces.Route
    dispatch: Dispatch
    drillDownTooltipEnabled: boolean
}

function showSocketNotification(props: NotificationProps) {
    const { route, dispatch, time, icon, iconColor, links, className, drillDownTooltipEnabled, ...rest } = props
    const drilldown = links?.[0]
    let key = `open${Date.now()}`
    let btnOptions: ButtonProps = {
        type: 'link'
    }
    const isDownloadFileDrillDownType = drilldown?.drillDownType.toString() === 'downloadFile'

    const handleClickDrillDownButton = () => {
        if (drilldown) {
            dispatch(actions.drillDown({ url: drilldown.drillDownLink, drillDownType: drilldown.drillDownType, route }))
        }
    }

    if (isDownloadFileDrillDownType) {
        btnOptions = {
            ...btnOptions,
            target: '_blank',
            href: CxBoxApiInstance.getMessageDownloadFileEndpoint(drilldown.drillDownLink),
            onClick: () => {
                closeNotification(key)
            }
        }
    } else {
        btnOptions = {
            ...btnOptions,
            onClick: () => {
                handleClickDrillDownButton()
                // closeNotification(key) // uncomment if needed
            }
        }
    }

    const drillDownButton = <Button {...btnOptions}>{drilldown?.drillDownLabel}</Button>

    return openBusinessNotification({
        key,
        className: cn(styles.notification, className),
        duration: 0,
        btn: drilldown ? (
            <span className={styles.buttonContainer}>
                {isDownloadFileDrillDownType ? (
                    drillDownButton
                ) : (
                    <SocketNotificationDrillDown
                        drillDownComponent={drillDownButton}
                        url={drilldown.drillDownLink}
                        type={drilldown.drillDownType}
                        drillDownTooltipEnabled={drillDownTooltipEnabled}
                    />
                )}
                {links?.length > 1 ? t('and more', { count: links.length - 1 }) : null}
            </span>
        ) : null,
        icon: icon ? <Icon type={icon} style={{ color: iconColor }} /> : null,
        ...rest
    })
}

export default showSocketNotification
