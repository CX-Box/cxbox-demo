import React from 'react'
import { NotificationLink } from '@interfaces/notification'
import { useDispatch } from 'react-redux'
import { actions } from '@actions'
import { useAppSelector } from '@store'
import styles from './WsLinks.module.less'

interface Props {
    links: NotificationLink[]
}

export const WsLinks: React.FC<Props> = ({ links }) => {
    const dispatch = useDispatch()
    const router = useAppSelector(state => state.router)

    const drilldown = (link: NotificationLink) => {
        dispatch(actions.drillDown({ url: link.drillDownLink, drillDownType: link.drillDownType, route: router }))
    }

    return (
        <div className={styles.linksWrapper}>
            {links.map((link, i) => (
                <span className={styles.link} key={i} onClick={() => drilldown(link)}>
                    {link.drillDownLabel}
                </span>
            ))}
        </div>
    )
}
