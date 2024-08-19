import { useAppSelector } from '@store'

export const useNavigationType = () => {
    return useAppSelector(
        state => state.session.screens.find(screen => screen.name === state.screen.screenName)?.meta?.navigation?.type ?? 'standard'
    )
}
