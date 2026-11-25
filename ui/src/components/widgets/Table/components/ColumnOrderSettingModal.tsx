import React, { useCallback } from 'react'
import { Modal, Transfer } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import { useTranslation } from 'react-i18next'
import { TransferProps } from 'antd/lib/transfer'
import TemplatedTitle from '@components/TemplatedTitle/TemplatedTitle'

interface ColumnOrderSettingModalProps extends Pick<ModalProps, 'onCancel' | 'visible'>, Pick<TransferProps, 'dataSource' | 'targetKeys'> {
    widgetName: string
    onChange: (fieldKeys: string[], visibility: boolean) => void
}

const ColumnOrderSettingModal: React.FC<ColumnOrderSettingModalProps> = ({
    widgetName,
    visible,
    onCancel,
    dataSource,
    onChange,
    targetKeys
}) => {
    const { t } = useTranslation()

    const handleChange = useCallback(
        (nextTargetKeys: string[], direction, moveKeys) => {
            if (direction === 'right') {
                onChange([...moveKeys], false)
            }

            if (direction === 'left') {
                onChange(moveKeys, true)
            }
        },
        [onChange]
    )

    return (
        <Modal visible={visible} onCancel={onCancel} footer={null}>
            <Transfer
                locale={{ itemUnit: t('column'), itemsUnit: t('columns') }}
                dataSource={dataSource}
                titles={[t('Main'), t('Additional')]}
                targetKeys={targetKeys}
                onChange={handleChange}
                render={item => <TemplatedTitle widgetName={widgetName} title={item.title ?? ''} />}
                listStyle={{ width: '44%' }}
            />
        </Modal>
    )
}

export default React.memo(ColumnOrderSettingModal)
