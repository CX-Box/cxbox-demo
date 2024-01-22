import { utils } from '@cxbox-ui/core'
import { RootState, store } from '@store'

export const buildBcUrl = (bcName: string, includeSelf: boolean = false, state?: RootState) => {
    return utils.buildBcUrl(bcName, includeSelf, (state ?? store.getState()) as any) // TODO fix
}
