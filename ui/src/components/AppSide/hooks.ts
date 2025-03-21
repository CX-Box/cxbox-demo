import { useAppSelector } from '@store'
import { EFeatureSettingKey, FeatureSetting } from '@interfaces/session'

type InfoItem = Omit<FeatureSetting, 'value'> & { value: string; isPinned: boolean }

export const useAppInfo = (defaultBcColor: string) => {
    const featureSettings = useAppSelector(state => state.session.featureSettings)
    const data = featureSettings?.filter(
        feature => [EFeatureSettingKey.infoEnv, EFeatureSettingKey.infoDescription].includes(feature.key) && feature.value
    ) as InfoItem[] | undefined

    const backgroundColor =
        featureSettings?.find(feature => EFeatureSettingKey.infoColor === feature.key && feature.value)?.value ?? defaultBcColor

    return {
        data: data?.map(item => (item.key === EFeatureSettingKey.infoEnv ? { ...item, isPinned: true } : item)),
        backgroundColor
    }
}
