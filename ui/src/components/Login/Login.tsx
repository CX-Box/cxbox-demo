import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../interfaces/storeSlices'
import { $do } from '../../actions/types'
import { Form, Input, Button, Icon } from 'antd'
import styles from './Login.less'

export const Login: React.FC = () => {
    const dispatch = useDispatch()
    const spin = useSelector((state: AppState) => state.session.loginSpin)
    const errorMsg = useSelector((state: AppState) => state.session.errorMsg)
    const [login, setLogin] = React.useState('vanilla')
    const [password, setPassword] = React.useState('vanilla')

    const onLogin = (login: string, password: string) => {
        dispatch($do.login({ login, password }))
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
                <span className={styles.error}>{errorMsg}</span>
            </Form.Item>
        </Form>
    )
}
