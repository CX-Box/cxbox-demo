import React from 'react'
import { Icon, Tooltip } from 'antd'
import Button from '@components/ui/Button/Button'
import styles from './ChartToggleButton.module.css'

interface ChartToggleButtonProps {
    chartIcon: string
    isTableView: boolean
    disabled: boolean
    tooltipTitle?: string
    onClick: () => void
}

const ChartToggleButton: React.FC<ChartToggleButtonProps> = ({ chartIcon, isTableView, disabled, tooltipTitle, onClick }) => {
    return (
        <Tooltip title={tooltipTitle} trigger="hover" placement="topRight">
            <div className={styles.container}>
                <Button className={styles.chartButton} disabled={disabled} type="empty" onClick={onClick}>
                    <Icon type={isTableView ? chartIcon : 'table'} />
                </Button>
            </div>
        </Tooltip>
    )
}

export default ChartToggleButton
