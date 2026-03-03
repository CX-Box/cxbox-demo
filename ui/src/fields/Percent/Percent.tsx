import { ComponentProps } from 'react'
import Number from '@fields/Number'

const Percent = (props: ComponentProps<typeof Number>) => {
    return <Number {...props} />
}

export default Percent
