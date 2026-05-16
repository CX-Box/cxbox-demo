import React from 'react'
import { WidgetComponentType } from '@features/Widget'
import { Skeleton, Spin } from 'antd'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'

const skeletonParams = { rows: 5 }

const WidgetLoader: WidgetComponentType = ({ widgetMeta, children, mode }) => {
    const bcName = widgetMeta.bcName
    const bc = useAppSelector(state => (bcName ? state.screen.bo.bc[bcName] : undefined))
    const loading = bc?.loading
    const bcUrl = buildBcUrl(bcName, true)
    const rowMetaExists = useAppSelector(state => !!state.view.rowMeta[bcName]?.[bcUrl])
    const dataExists = useAppSelector(state => !!state.data[bcName])

    if (mode === 'skip_load' || mode === 'headless') {
        return <>{children}</>
    }

    const showSpinner = !!(loading && (rowMetaExists || dataExists))
    const showSkeleton = loading && !showSpinner

    return (
        <>
            {showSkeleton && (
                <div data-test-loading={true}>
                    <Skeleton loading paragraph={skeletonParams} />
                </div>
            )}
            {!showSkeleton && <Spin spinning={showSpinner}>{children}</Spin>}
        </>
    )
}

export default WidgetLoader
