import React from 'react'
import { Dropdown, Icon } from 'antd'
import Button from '../../../ui/Button/Button'
import { DropDownProps } from 'antd/lib/dropdown'

interface DropdownSettingProps extends Omit<DropDownProps, 'trigger'> {
    buttonClassName?: string
}

function DropdownSetting({ buttonClassName, ...restProps }: DropdownSettingProps) {
    return (
        <Dropdown {...restProps} trigger={['click']}>
            <Button type="empty" className={buttonClassName}>
                <Icon type="setting" />
            </Button>
        </Dropdown>
    )
}

export default React.memo(DropdownSetting)
