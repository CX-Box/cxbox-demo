import React from 'react'
import { Popover } from 'antd'
import { MoreLinkContentArg } from '@fullcalendar/core'
import styles from './MoreLink.less'
import { useTranslation } from 'react-i18next'

interface MoreLinkProps extends MoreLinkContentArg {}

export const MoreLink: React.FC<MoreLinkProps> = ({ ...arg }) => {
    const { t } = useTranslation()

    const popoverContent = <div>{t('Click on the date to see all events')}</div>

    return (
        <Popover className={'fc-more-link-popover'} content={popoverContent} trigger="click" placement="bottom">
            <span className={styles.moreLink}>{arg.text}</span>
        </Popover>
    )
}
