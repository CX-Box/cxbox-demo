import React from 'react'
import { Collapse } from 'antd'
import FormattedJSON from './components/FormattedJSON'
import WidgetInfoLabel from './components/WidgetInfoLabel'
import { WidgetMeta } from '@cxbox-ui/core/interfaces'
import { useAppSelector } from '../../store'

interface DebugPanelProps {
    widgetMeta: WidgetMeta
}

const DebugPanel: React.FunctionComponent<DebugPanelProps> = props => {
    const { widgetMeta } = props
    const { Panel } = Collapse
    const widget = useAppSelector(store => store.view.widgets.find(i => i.name === widgetMeta.name))
    const bc = useAppSelector(store => store.screen.bo.bc[widgetMeta.bcName])
    const data = useAppSelector(store => store.data[widgetMeta.bcName])
    const widgetText = `"name": "${widget.name ?? ''}"`
    const titleText = `"title": "${widget.title ?? ''}"`
    const bcText = `"bc": "${widget.bcName ?? ''}"`
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
