import React from 'react'
import { Icon } from 'antd'
import Button from '@components/ui/Button/Button'
import styles from './ChartToggleButton.module.css'

interface ChartToggleButtonProps {
    chartIcon: string
    isTableView: boolean
    onClick: () => void
}

const ChartToggleButton: React.FC<ChartToggleButtonProps> = ({ chartIcon, isTableView, onClick }) => {
    return (
        <Button className={styles.container} type="empty" onClick={onClick}>
            <Icon type={isTableView ? chartIcon : 'table'} />
        </Button>
    )
}

export default ChartToggleButton
