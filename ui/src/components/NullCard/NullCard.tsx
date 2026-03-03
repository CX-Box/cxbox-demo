import { AppWidgetMeta } from '@interfaces/widget'

interface NullCardProps {
    meta: AppWidgetMeta
}

const NullCard: React.FC<NullCardProps> = ({ meta, children }) => {
    return (
        <div
            data-test="WIDGET"
            data-test-widget-type={meta.type}
            data-test-widget-position={meta.position}
            data-test-widget-title={meta.title}
            data-test-widget-name={meta.name}
        >
            {children}
        </div>
    )
}

export default NullCard
