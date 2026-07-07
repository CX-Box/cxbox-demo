import React from 'react'
import { Dropdown } from 'antd'
import RowOperationsMenu from './RowOperationsMenu'
import { AppWidgetMeta } from '@interfaces/widget'
import Button from '@components/ui/Button/Button'
import styles from './RowOperationsButton.less'
import { DropDownProps } from 'antd/lib/dropdown'

interface RowOperationsButtonProps extends Pick<DropDownProps, 'getPopupContainer'> {
    widget: AppWidgetMeta
    onClick?: React.MouseEventHandler<HTMLElement>
}

const RowOperationsButton = ({ widget, onClick, getPopupContainer }: RowOperationsButtonProps) => {
    return (
        <Dropdown
            placement="bottomRight"
            trigger={['click']}
            overlay={<RowOperationsMenu widget={widget} />}
            getPopupContainer={getPopupContainer}
        >
            <Button
                className={styles.button}
                type="default"
                shape="circle"
                data-test-widget-list-row-action={true}
                icon="ellipsis"
                onClick={onClick}
                size="small"
            />
        </Dropdown>
    )
}

export default React.memo(RowOperationsButton)
