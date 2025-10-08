import React from 'react'
import { useAppSelector } from '@store'
import SystemAlert from './components/SystemAlert'
import { EFeatureSettingKey } from '@interfaces/session'

export default function SystemNotifications() {
    const systemNotifications = useAppSelector(state => state.view.systemNotifications)
    const timeoutShowMessage = useAppSelector(state =>
        state.session.featureSettings?.find(featureSetting => featureSetting.key === EFeatureSettingKey.timeoutShowMessage)
    )?.value

    return (
        <>
            {systemNotifications?.map(i => (
                <SystemAlert key={i.id} message={i.message} type={i.type} id={i.id} duration={Number(timeoutShowMessage)} />
            ))}
        </>
    )
}
