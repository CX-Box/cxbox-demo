import { DataItem } from '@cxbox-ui/core'
import { ColumnProps } from 'antd/es/table'

export interface CustomDataItem extends Pick<DataItem, 'id' | 'vstamp'> {
    [key: string]: any
}

export type ControlColumn<T> = { column: ColumnProps<T>; position: 'left' | 'right' }
