import { SNOW_END, SNOW_START } from '@components/AppSide/Snowflakes/constants'

export const isDateInRange = () => {
    const today = new Date()
    const year = today.getFullYear()

    const todayStart = new Date(year, today.getMonth(), today.getDate())
    const startDate = new Date(year, SNOW_START.month, SNOW_START.day)
    const endDate = new Date(year, SNOW_END.month, SNOW_END.day)

    if (startDate > endDate) {
        return todayStart >= startDate || todayStart <= endDate
    }

    return todayStart >= startDate && todayStart <= endDate
}
