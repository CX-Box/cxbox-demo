import React, { FunctionComponent } from 'react'
import { WidgetMeta } from '@cxbox-ui/core/interfaces/widget'
import styles from './Header.module.css'
import { TemplatedTitle } from '@teslerComponents'

interface HeaderProps {
    meta: WidgetMeta
}

const TitleContainer: FunctionComponent<{ title: string }> = ({ title }) => {
    return <h1 className={styles.header}>{title}</h1>
}

function Header({ meta }: HeaderProps) {
    const { title, name } = meta
    return <TemplatedTitle title={title} widgetName={name} container={TitleContainer} />
}

export default React.memo(Header)
