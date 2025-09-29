import React from 'react'
import styles from '@assets/styles/dataEntry.less'

/**
 * Adds the base class 'fieldBase' to the wrapped component.
 *
 * @param WrappedComponent
 */
function withFieldBaseTheme<P extends { className?: string }>(WrappedComponent: React.ComponentType<P>) {
    const WrapperComponent = (props: P) => {
        return (
            <div className={styles.fieldBaseTheme}>
                <WrappedComponent {...props} />
            </div>
        )
    }

    WrapperComponent.displayName = `withFieldBase(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

    return React.memo(WrapperComponent)
}

export default withFieldBaseTheme
