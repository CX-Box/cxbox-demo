import React from 'react'

type State = {
    hasError: boolean
    error?: Error
}

type Props = {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export default class DocumentErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? <div>Failed to load PDF file</div>
        }
        return this.props.children
    }
}
