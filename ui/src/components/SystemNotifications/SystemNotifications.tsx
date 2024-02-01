import React from 'react'
import { useAppSelector } from '@store'
import SystemAlert from './components/SystemAlert'

export default function SystemNotifications() {
    const systemNotifications = useAppSelector(state => state.view.systemNotifications)
    return (
        <>
            {systemNotifications?.map(i => (
                <SystemAlert key={i.id} message={i.message} type={i.type} id={i.id} />
            ))}
        </>
    )
}
