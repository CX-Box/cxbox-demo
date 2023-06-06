import React from 'react'
import DebugPanel from '@teslerComponents/DebugPanel/DebugPanel'
import RefreshButton from './components/RefreshButton'
import styles from './WidgetErrorBoundary.less'
import { WidgetMeta } from '@tesler-ui/core'

interface ErrorBoundaryProps {
    meta?: WidgetMeta
    msg?: React.ReactNode
    children?: React.ReactNode
}

export default class WidgetErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean; error?: Error }> {
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: undefined }
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error(error)
    }
    render() {
        if (this.state.hasError) {
            return (
                <>
                    {this.props.meta ? (
                        <>
                            <h1>
                                {this.props.meta.title} <RefreshButton />
                            </h1>
                            <DebugPanel widgetMeta={this.props.meta} />
                        </>
                    ) : null}
                    <div className={styles.stackContainer}>
                        {this.props.msg}
                        <h1 className={styles.errorMessage}>{this.state.error?.message}</h1>
                        <div className={styles.errorStack}>{this.state.error?.stack}</div>
                    </div>
                </>
            )
        }
        return this.props.children
    }
}
