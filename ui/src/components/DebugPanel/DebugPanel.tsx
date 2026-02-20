import React, { useCallback, useMemo, useState } from 'react'
import { Icon, Modal } from 'antd'
import cn from 'classnames'
import { interfaces } from '@cxbox-ui/core'
import FormattedJSON from '../FormattedJSON/FormattedJSON'
import WidgetInfoLabel from './components/WidgetInfoLabel'
import styles from './DebugPanel.module.less'
import { useAppSelector } from '@store'

interface DebugPanelProps {
    className?: string
    widgetMeta: interfaces.WidgetMeta
}

const DebugPanel: React.FunctionComponent<DebugPanelProps> = props => {
    const { className, widgetMeta } = props

    const [isContentVisible, setIsContentVisible] = useState(false)
    const [currentOpenedModalName, setCurrentOpenedModalName] = useState<string | undefined>(undefined)

    const changeContentVisibleStatus = useCallback(() => {
        setIsContentVisible(prevState => !prevState)
    }, [])

    const widget = useAppSelector(state => state.view.widgets.find(i => i.name === widgetMeta.name))
    const bc = useAppSelector(state => state.screen.bo.bc[widgetMeta.bcName])
    const data = useAppSelector(state => state.data[widgetMeta.bcName])

    const modalContent = useMemo(() => {
        return [
            {
                buttonName: 'Widget',
                content: widget
            },
            {
                buttonName: 'BC',
                content: bc
            },
            {
                buttonName: 'Data',
                content: data
            }
        ]
    }, [widget, bc, data])
    const modalContentNames = Object.values(modalContent).reduce<string[]>((result, item) => {
        return item.content ? [...result, item.buttonName] : result
    }, [])
    const currentOpenedModalContent = modalContent.find(item => item.buttonName === currentOpenedModalName)?.content

    const widgetText = `"name": "${widget?.name ?? ''}"`
    const titleText = `"title": "${widget?.title ?? ''}"`
    const bcText = `"bc": "${widget?.bcName ?? ''}"`

    let infoList = [widgetText]
    if (isContentVisible) {
        infoList = [...infoList, titleText, bcText]
    }

    return (
        <div className={cn(styles.debugPanel, className)}>
            {isContentVisible && (
                <Modal
                    visible={!!currentOpenedModalContent}
                    title={currentOpenedModalName}
                    cancelButtonProps={{
                        hidden: true
                    }}
                    onOk={() => setCurrentOpenedModalName(undefined)}
                    onCancel={() => setCurrentOpenedModalName(undefined)}
                >
                    <FormattedJSON json={currentOpenedModalContent as unknown as Record<string, unknown>} />
                </Modal>
            )}

            <WidgetInfoLabel infoList={infoList} noContainer={true} />

            {isContentVisible &&
                modalContentNames.map(item => {
                    return (
                        <button key={item} className={styles.button} onClick={() => setCurrentOpenedModalName(item)}>
                            <span className={styles.buttonText}>{item}</span>
                            <Icon type="down" />
                        </button>
                    )
                })}

            <button
                className={cn(styles.button, {
                    [styles.activeButton]: isContentVisible
                })}
                onClick={changeContentVisibleStatus}
            >
                <Icon type="menu" />
            </button>
        </div>
    )
}

export default React.memo(DebugPanel)
