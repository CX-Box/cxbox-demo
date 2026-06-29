import { WidgetComponentType } from '@features/Widget'
import WidgetLoader from '@components/WidgetLoader'
import styles from './EmptyWidget.module.css'

const EmptyWidget: WidgetComponentType = props => {
    return (
        <div
            className={styles.container}
            data-test="WIDGET"
            data-test-widget-type={props.widgetMeta.type}
            data-test-widget-position={props.widgetMeta.position}
            data-test-widget-title={props.widgetMeta.title}
            data-test-widget-name={props.widgetMeta.name}
        >
            <h2 className={styles.title}>{props.widgetMeta.title}</h2>
            <WidgetLoader widgetMeta={props.widgetMeta}>{null}</WidgetLoader>
        </div>
    )
}

export default EmptyWidget
