import { WidgetComponentType } from '@features/Widget'

const NullCard: WidgetComponentType = ({ widgetMeta, children, mode }) => {
    if (mode === 'skip_card' || mode === 'headless') {
        return <>{children}</>
    }
    return (
        <div
            data-test="WIDGET"
            data-test-widget-type={widgetMeta.type}
            data-test-widget-position={widgetMeta.position}
            data-test-widget-title={widgetMeta.title}
            data-test-widget-name={widgetMeta.name}
        >
            {children}
        </div>
    )
}

export default NullCard
