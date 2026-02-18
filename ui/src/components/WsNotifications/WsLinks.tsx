import React from 'react'
import { useDispatch } from 'react-redux'
import DrillDown from '@components/ui/DrillDown/DrillDown'
import { actions } from '@actions'
import { useAppSelector } from '@store'
import { NotificationLink } from '@interfaces/notification'
import styles from './WsLinks.module.module.less'

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
                <span key={i}>
                    <DrillDown
                        displayedValue={link.drillDownLabel}
                        url={link.drillDownLink}
                        type={link.drillDownType}
                        onDrillDown={() => drilldown(link)}
                    />
                </span>
            ))}
        </div>
    )
}
