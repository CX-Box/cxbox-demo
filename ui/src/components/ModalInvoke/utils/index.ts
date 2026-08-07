import { ModalProps } from 'antd/lib/modal'

export function getModalDataTestProps() {
    return {
        wrapProps: {
            'data-test-confirm-popup': true
        },
        okButtonProps: {
            'data-test-confirm-popup-button-ok': true
        },
        cancelButtonProps: {
            'data-test-confirm-popup-button-cancel': true
        }
    } as Pick<ModalProps, 'wrapProps' | 'okButtonProps' | 'cancelButtonProps'>
}
