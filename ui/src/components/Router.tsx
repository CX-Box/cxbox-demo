import { FC, ReactNode, useEffect, useRef } from 'react'
import { Spin } from 'antd'
import { useHooks } from '../hooks/useHooks.ts'

interface Props {
    children: ReactNode
}

export const Router: FC<Props> = ({ children }) => {
    const hooks = useHooks()
    const { bcMap } = hooks.useBcLocation()
    const { data: screenMeta, isLoading } = hooks.useScreenMeta()
    const setInitialBcTree = hooks.useStore(state => state.setInitialBcTree)
    const mergeBcTree = hooks.useStore(state => state.mergeBcTree)

    const isScreenChanged = useRef<boolean>(false)

    useEffect(() => {
        isScreenChanged.current = true
    }, [screenMeta?.name])

    useEffect(() => {
        if (!isLoading && screenMeta?.meta?.bo.bc) {
            if (isScreenChanged.current) {
                const bcTree = screenMeta.meta.bo.bc.map(bc => ({
                    name: bc.name,
                    parentName: bc.parentName,
                    cursor: bcMap.get(bc.name) || null,
                    virtualForms: {},
                    filters: [],
                    sorters: [],
                    pagination: {
                        page: 1
                    }
                }))
                setInitialBcTree(bcTree)
                isScreenChanged.current = false
            } else {
                const urlBcTree = screenMeta.meta.bo.bc
                    .filter(bc => bcMap.has(bc.name))
                    .map(bc => ({
                        name: bc.name,
                        parentName: bc.parentName,
                        cursor: bcMap.get(bc.name) || null,
                        virtualForms: {},
                        filters: [],
                        sorters: [],
                        pagination: {
                            page: 1
                        }
                    }))
                mergeBcTree(urlBcTree)
            }
        }
    }, [isLoading, screenMeta?.meta?.bo.bc, setInitialBcTree, bcMap, mergeBcTree])

    return (
        <Spin spinning={isLoading} delay={300} fullscreen={isLoading}>
            {children}
        </Spin>
    )
}
