import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'

export const useWidgetLoading = (bcName: string | undefined = '') => {
    const bc = useAppSelector(state => (bcName ? state.screen.bo.bc[bcName] : undefined))
    const rowMetaExist = !!useAppSelector(state => {
        const bcUrl = buildBcUrl(bcName, true, state)

        return bcUrl ? state.view.rowMeta[bcName]?.[bcUrl] : undefined
    })
    const dataExist = !!useAppSelector(state => (bcName ? state.data[bcName] : undefined))

    return bc?.loading || !rowMetaExist || !dataExist
}
