import { useBcLocation } from '@hooks/useBcLocation'
import { useCallback } from 'react'
import { BcMeta, LoginResponse } from '@cxbox-ui/core'
import { useMeta } from './useMeta'

export const useScreenBcMeta = (bcName: string) => {
    const [location] = useBcLocation()

    const bcSelector = useCallback(
        (data: LoginResponse) => {
            const screen =
                data?.screens.find(screen => screen.name === location.screenName) ||
                data?.screens.find(screen => screen.defaultScreen) ||
                data?.screens[0]

            const bcList = screen?.meta?.bo.bc
            const thisBc = bcList?.find(bc => bc.name === bcName)
            // recursive find all parents
            let branch: BcMeta[] = []
            // find this bc
            if (thisBc) {
                branch.push(thisBc)
                if (thisBc.parentName !== null) {
                    collectDirectParents(thisBc.parentName)
                }
            }
            function collectDirectParents(parentBcName: string) {
                const parent = bcList?.find(bc => bc.name === parentBcName)
                if (parent) {
                    branch.push(parent)
                    if (parent.parentName !== null) {
                        collectDirectParents(parent.parentName)
                    }
                }
            }

            return branch.reverse()
        },
        [bcName, location.screenName]
    )

    return useMeta(bcSelector)
}
