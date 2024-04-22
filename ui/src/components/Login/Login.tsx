import React from 'react'
import { useDispatch } from 'react-redux'
import { actions } from '@cxbox-ui/core'
import { Form, Input, Button, FormProps } from 'antd-5'
import styles from './Login.less'
import { useAppSelector } from '@store'
import { useTranslation } from 'react-i18next'
import { LockOutlined, UserOutlined } from '@ant-design/icons'

type FieldType = {
    login?: string
    password?: string
}

export const Login: React.FC = () => {
    const dispatch = useDispatch()
    const spin = useAppSelector(state => state.session.loginSpin)
    const errorMsg = useAppSelector(state => state.session.errorMsg) ?? ''
    const { t } = useTranslation()

    const handleLogin: FormProps<FieldType>['onFinish'] = ({ login, password }) => {
        if (login && password) {
            dispatch(actions.login({ login, password }))
        }
    }

    return (
        <Form
            name={'Login Form'}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 24 }}
            style={{ maxWidth: 600 }}
            onFinish={handleLogin}
            autoComplete="off"
            initialValues={{ login: 'vanilla', password: 'vanilla' }}
        >
            <Form.Item<FieldType> name={'login'} rules={[{ required: true, message: 'Please, enter your login!' }]}>
                <Input placeholder="Username" prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item<FieldType> name={'password'} rules={[{ required: true, message: 'Please, enter your password!' }]}>
                <Input prefix={<LockOutlined />} placeholder="Password" type="password" />
            </Form.Item>
            <Form.Item>
                <Button block autoFocus loading={spin} type="primary" htmlType="submit">
                    Sign in
                </Button>
                <span className={styles.error}>{t(errorMsg)}</span>
            </Form.Item>
        </Form>
    )
}
