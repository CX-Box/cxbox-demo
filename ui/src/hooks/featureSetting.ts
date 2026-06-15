import { useAppSelector } from '@store'
import { EFeatureSettingKey } from '@interfaces/session'

export const useFeatureSettingItem = (key: EFeatureSettingKey) => {
    return useAppSelector(state => state.session.featureSettings?.find(feature => feature.key === key))
}

export const useFeatureSettingFlag = (key: EFeatureSettingKey, defaultValue = false): boolean => {
    const value = useFeatureSettingItem(key)?.value

    return value === undefined ? defaultValue : value === 'true'
}

export const useFeatureSettingValue = (key: EFeatureSettingKey, defaultValue?: string): string | null | undefined => {
    const value = useFeatureSettingItem(key)?.value

    return value === undefined ? defaultValue : value
}
