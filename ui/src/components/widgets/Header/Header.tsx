import React, { FunctionComponent } from 'react'
import styles from './Header.less'
import { interfaces } from '@cxbox-ui/core'
import { TemplatedTitle } from '@cxboxComponents'

interface HeaderProps {
    meta: interfaces.WidgetMeta
}

const TitleContainer: FunctionComponent<{ title: string }> = ({ title }) => {
    return <h1 className={styles.header}>{title}</h1>
}

function Header({ meta }: HeaderProps) {
    const { title, name } = meta
    return <TemplatedTitle title={title} widgetName={name} container={TitleContainer} />
}

export default React.memo(Header)
