import React from 'react'

export default class DocumentErrorBoundary extends React.Component<{}, { hasError: boolean; error?: Error }> {
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    constructor(props: any) {
        super(props)
        this.state = { hasError: false, error: undefined }
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error(error)
    }

    render() {
        if (this.state.hasError) {
            return <div>Failed to load PDF file</div>
        }

        return this.props.children
    }
}
