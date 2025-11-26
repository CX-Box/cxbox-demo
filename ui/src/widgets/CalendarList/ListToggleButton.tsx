import React from 'react'
import { Icon, Tooltip } from 'antd'
import Button from '@components/ui/Button/Button'
import styles from './ListToggleButton.module.css'

interface ListToggleButtonProps {
    widgetIcon: string
    isList: boolean
    disabled: boolean
    tooltipTitle?: string
    onClick: () => void
}

const ListToggleButton: React.FC<ListToggleButtonProps> = ({ widgetIcon, isList, disabled, tooltipTitle, onClick }) => {
    return (
        <Tooltip title={tooltipTitle} trigger="hover" placement="topRight">
            <div className={styles.container}>
                <Button className={styles.listButton} disabled={disabled} type="empty" onClick={onClick}>
                    <Icon type={isList ? widgetIcon : 'table'} />
                </Button>
            </div>
        </Tooltip>
    )
}

export default ListToggleButton
