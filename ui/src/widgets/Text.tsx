import { FC } from 'react'
import { WidgetAnyProps } from '../components/Widget.tsx'
import { WidgetWIP } from '../components/WidgetWIP.tsx'

export const Text: FC<WidgetAnyProps> = () => {
    return <WidgetWIP type={'Text'} />
}
