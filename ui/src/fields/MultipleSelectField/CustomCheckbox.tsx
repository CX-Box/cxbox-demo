import React from 'react'
import checkbox from '@assets/icons/checkbox.svg'
import checkboxEmpty from '@assets/icons/checkboxEmpty.svg'
import styles from './CustomCheckbox.less'

interface CustomCheckboxProps {
    checked: boolean
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked }) => {
    return (
        <span className={styles.checkboxIcon} data-test-checked={checked}>
            <img data-visible={checked} alt={'checkbox'} src={checkbox} />
            <img data-visible={!checked} alt={'checkboxEmpty'} src={checkboxEmpty} />
        </span>
    )
}

export default CustomCheckbox
