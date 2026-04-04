import { ModalProps } from 'antd/lib/modal'

export function getModalDataTestProps() {
    return {
        wrapProps: {
            'data-test-confirm-popup': true
        } as any,
        okButtonProps: {
            'data-test-confirm-popup-button-ok': true
        } as any,
        cancelButtonProps: {
            'data-test-confirm-popup-button-cancel': true
        } as any
    } as Pick<ModalProps, 'wrapProps' | 'okButtonProps' | 'cancelButtonProps'>
}
