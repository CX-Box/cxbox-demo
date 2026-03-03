import { AppWidgetMeta } from '@interfaces/widget'
import styles from './DefaultCard.module.less'

interface DefaultCardProps {
    meta: AppWidgetMeta
}

const DefaultCard: React.FC<DefaultCardProps> = ({ meta, children }) => (
    <div
        className={styles.container}
        data-test="WIDGET"
        data-test-widget-type={meta.type}
        data-test-widget-position={meta.position}
        data-test-widget-title={meta.title}
        data-test-widget-name={meta.name}
    >
        <h2 className={styles.title}>{meta.title}</h2>
        {children}
    </div>
)

export default DefaultCard
