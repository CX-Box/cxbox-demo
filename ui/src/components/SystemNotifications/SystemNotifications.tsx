import React from 'react'
import { useSelector } from 'react-redux'
import { AppState } from '../../interfaces/storeSlices'
import SystemAlert from './components/SystemAlert'

export default function SystemNotifications() {
    const systemNotifications = useSelector((state: AppState) => state.view.systemNotifications)
    return (
        <>
            {systemNotifications?.map(i => (
                <SystemAlert key={i.id} message={i.message} type={i.type} id={i.id} />
            ))}
        </>
    )
}
