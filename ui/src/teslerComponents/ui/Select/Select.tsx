import React from 'react'
import { Select as AntdSelect } from 'antd'
import { SelectProps as AntdSelectProps, SelectValue } from 'antd/lib/select'

export type SelectProps = AntdSelectProps & {
    forwardedRef?: React.RefObject<AntdSelect<string>>
}

/**
 * Wrapper for original rc-select due to performance problems with last version
 * https://github.com/react-component/select/issues/378
 *
 * @category Components
 */
export class Select<T = SelectValue> extends React.PureComponent<SelectProps> {
    /**
     * STUB
     */
    static Option = AntdSelect.Option

    /**
     * STUB
     */
    render() {
        const extendedProps: any = {
            ...this.props,
            transitionName: ''
        }

        return <AntdSelect {...extendedProps} className={this.props.className} ref={this.props.forwardedRef} />
    }
}

/**
 * @category Components
 */
export default Select
