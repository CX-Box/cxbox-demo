import { DataItem, IdItemResponse } from '@cxbox-ui/core'
import { FC, memo, ReactNode } from 'react'
import { Icon, Tooltip } from 'antd'
import styles from './../Table.less'

interface Props {
    record: Partial<IdItemResponse>
    selectedRow?: Omit<DataItem, 'vstamp'>
}

const ResultColumnCell: FC<Props> = props => {
    const resultRecord = { ...props.record, ...props.selectedRow }

    let content: ReactNode = null

    if (typeof resultRecord.success !== 'boolean') {
        content = <Icon className={styles.columnIcon} type="minus-circle" theme="filled" />
    } else if (resultRecord.success) {
        content = <Icon className={styles.columnIcon} type="check-circle" theme="filled" />
    } else {
        content = (
            <Tooltip trigger="hover" title={resultRecord.errorMessage ?? ''}>
                <Icon className={styles.columnIcon} type="close-square" theme="filled" />
            </Tooltip>
        )
    }

    return <div className={styles.massResultColum}>{content}</div>
}

export default memo(ResultColumnCell)
