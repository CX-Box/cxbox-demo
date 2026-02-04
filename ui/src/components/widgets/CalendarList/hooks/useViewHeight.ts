import { useWindowSize } from '@hooks/useWindowSize'

export const useViewHeight = () => {
    return useWindowSize({ wait: 200, track: { height: true } }).height as number
}
