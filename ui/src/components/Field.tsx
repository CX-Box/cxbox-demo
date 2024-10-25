import { Input } from 'antd'
import { useRowMeta } from '@hooks/queries'
import { changeFieldValue, setFieldTouched, useBcFormField } from '@hooks/useBcForm'
import { ChangeEventHandler } from 'react'

interface FieldProps {
    bcPath: string
    type: string
    name: string
}

export const Field = ({ name, bcPath }: FieldProps) => {
    const field = useBcFormField({ bcPath, fieldName: name })

    const inputChangeHandler: ChangeEventHandler<HTMLInputElement> = e => {
        changeFieldValue({ bcPath, fieldName: name, value: e.target.value })
    }

    const inputFocusHandler = () => {
        setFieldTouched({ bcPath, fieldName: name })
    }

    return <Input name={name} value={field?.value} onChange={inputChangeHandler} onFocus={inputFocusHandler} />
}
