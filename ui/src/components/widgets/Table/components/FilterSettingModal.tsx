import React, { useCallback } from 'react'
import { Form, Icon, Modal, Tooltip, Typography } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import Button from '../../../ui/Button/Button'
import { FormComponentProps } from 'antd/lib/form/Form'
import { useTranslation } from 'react-i18next'
import styles from './FilterSettingModal.less'
import { FilterGroup } from '../../../../interfaces/filters'
import Input from './Input'

interface FilterSettingModalProps extends Pick<ModalProps, 'visible'>, FormComponentProps {
    filtersExist?: boolean
    onSubmit?: (values: { name: string }) => void
    onDelete?: (name: string, id: string) => void
    onCancel: () => void
    filterGroups?: FilterGroup[]
}

const FilterSettingModal = Form.create<FilterSettingModalProps>({ name: 'filterSettings' })(
    ({ visible, onCancel, form, onSubmit, filterGroups, filtersExist, onDelete }: FilterSettingModalProps) => {
        const { t } = useTranslation()
        const { getFieldDecorator, resetFields } = form

        const handleSubmit = useCallback(
            e => {
                e.preventDefault()
                form.validateFieldsAndScroll((err, values) => {
                    if (!err) {
                        onSubmit?.(values)
                        onCancel?.()
                        resetFields()
                    }
                })
            },
            [form, onCancel, onSubmit, resetFields]
        )

        const handleCancel = useCallback(() => {
            onCancel?.()
        }, [onCancel])

        const filterIsEmpty = !filtersExist

        return (
            <Modal visible={visible} title={t('Filter group setting')} onCancel={handleCancel} footer={null}>
                <div className={styles.filterGroups}>
                    {filterGroups
                        ?.filter(filterGroup => filterGroup.personal)
                        ?.map(group => (
                            <div key={group.name}>
                                <span>{group.name}</span>{' '}
                                <Tooltip title={t('remove filter group')}>
                                    <Icon type="close" onClick={() => group.id && onDelete?.(group.name, group.id)} />
                                </Tooltip>
                            </div>
                        ))}
                </div>
                <Form onSubmit={handleSubmit} className={styles.form} layout="inline">
                    <Form.Item>
                        {getFieldDecorator('name', {
                            rules: [
                                {
                                    required: true,
                                    message: t('Please input filter group name')
                                }
                            ]
                        })(<Input height={40} placeholder={t('name')} disabled={filterIsEmpty} />)}
                    </Form.Item>

                    <Form.Item>
                        <Button type="customDefault" htmlType="submit" disabled={filterIsEmpty}>
                            {t('create')}
                        </Button>
                    </Form.Item>
                </Form>
                {filterIsEmpty && <Typography.Text type="danger">{t('No applied filters for saving')}</Typography.Text>}
            </Modal>
        )
    }
)

export default React.memo(FilterSettingModal)
