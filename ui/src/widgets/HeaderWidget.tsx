import { WidgetAnyProps } from '../components/Widget.tsx'
import { FC } from 'react'
import { WidgetWIP } from '../components/WidgetWIP.tsx'

export const HeaderWidget: FC<WidgetAnyProps> = () => {
    return <WidgetWIP type={'HeaderWidget'} />
}
