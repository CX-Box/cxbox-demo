import React from 'react'
import { Collapse } from 'antd'
import WidgetInfoLabel from './components/WidgetInfoLabel'
import { interfaces } from '@cxbox-ui/core'
import { useAppSelector } from '@store'
import FormattedJSON from '@components/FormattedJSON/FormattedJSON'

interface DebugPanelProps {
    widgetMeta: interfaces.WidgetMeta
}

const DebugPanel: React.FunctionComponent<DebugPanelProps> = props => {
    const { widgetMeta } = props
    const { Panel } = Collapse
    const widget = useAppSelector(state => state.view.widgets.find(i => i.name === widgetMeta.name))
    const bc = useAppSelector(state => state.screen.bo.bc[widgetMeta.bcName])
    const data = useAppSelector(state => state.data[widgetMeta.bcName])
    const widgetText = `"name": "${widget?.name ?? ''}"`
    const titleText = `"title": "${widget?.title ?? ''}"`
    const bcText = `"bc": "${widget?.bcName ?? ''}"`
    const infoList = [widgetText, titleText, bcText]
    return (
        <>
            <WidgetInfoLabel infoList={infoList} />
            <Collapse>
                <Panel header="Widget" key="widgetDebug">
                    <FormattedJSON json={widget as unknown as Record<string, unknown>} />
                </Panel>
                <Panel header="BC" key="bcDebug">
                    <FormattedJSON json={bc as unknown as Record<string, unknown>} />
                </Panel>
                <Panel header="Data" key="dataDebug">
                    <FormattedJSON json={data as unknown as Record<string, unknown>} />
                </Panel>
            </Collapse>
        </>
    )
}

const MemoizedDebugPanel = React.memo(DebugPanel)
export default MemoizedDebugPanel
