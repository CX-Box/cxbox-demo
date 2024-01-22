import React, { useCallback, useEffect, useState } from 'react'
import { DatePickerProps as AntdDatePickerProps } from 'antd/lib/date-picker/interface'
import { DatePicker as CoreDatePicker } from 'antd'
import { dateFormat } from '../../interfaces/date'
import moment from 'moment'
import { Moment } from 'moment/moment'
import { interfaces } from '@cxbox-ui/core'

interface DatePickerProps extends Omit<AntdDatePickerProps, 'value' | 'onChange' | 'onOpenChange'> {
    value: interfaces.DataValue[]
    onChange: (value: interfaces.DataValue[]) => void
}

function DatePicker(props: DatePickerProps) {
    const fixedPartOfProps = useDatePicker(props)

    return <CoreDatePicker {...props} {...fixedPartOfProps} />
}

export default React.memo(DatePicker)

function useDatePicker({ value, open, onChange }: DatePickerProps) {
    const [localOpen, setLocalOpen] = useState<boolean>(false)
    const [init, setInit] = useState<boolean>(false)

    useEffect(() => {
        if (open && !value && !init) {
            setTimeout(() => {
                setLocalOpen(true)
                setInit(true)
            }, 100)
        } else if (!open && !value && init) {
            setInit(false)
        }
    }, [init, open, value])

    const handleOpenChange = useCallback((status: boolean) => {
        setLocalOpen(status)
    }, [])

    const handleChange = (date: Moment | null) => {
        onChange([date?.startOf('day').toISOString(), date?.endOf('day').toISOString()])
    }

    return {
        value: value?.[0] ? moment(value?.[0] as string, dateFormat) : null,
        open: localOpen,
        onOpenChange: handleOpenChange,
        onChange: handleChange
    }
}
