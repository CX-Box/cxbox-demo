import { useWindowSize } from '@hooks/useWindowSize'

export const useViewHeight = (disabled: boolean = false) => {
    const { height } = useWindowSize({
        wait: 200,
        track: {
            width: false,
            height: !disabled
        }
    })

    return disabled ? undefined : height
}
