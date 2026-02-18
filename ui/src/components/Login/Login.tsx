import React from 'react'
import { useDispatch } from 'react-redux'
import { actions } from '@cxbox-ui/core'
import { Form, Input, Button, Icon } from 'antd'
import styles from './Login.module.less'
import { useAppSelector } from '@store'
import { useTranslation } from 'react-i18next'

export const Login: React.FC = () => {
    const dispatch = useDispatch()
    const spin = useAppSelector(state => state.session.loginSpin)
    const errorMsg = useAppSelector(state => state.session.errorMsg) ?? ''
    const [login, setLogin] = React.useState('vanilla')
    const [password, setPassword] = React.useState('vanilla')
    const { t } = useTranslation()

    const onLogin = (login: string, password: string) => {
        dispatch(actions.login({ login, password }))
    }

    const handleLogin = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLogin(event.target.value)
    }

    const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value)
    }

    const handleClick = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        onLogin(login, password)
    }

    return (
        <Form onSubmit={handleClick}>
            <Form.Item>
                <Input prefix={<Icon type="user" />} placeholder="Username" value={login} onChange={handleLogin} />
            </Form.Item>
            <Form.Item>
                <Input.Password prefix={<Icon type="lock" />} placeholder="Password" value={password} onChange={handlePassword} />
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
