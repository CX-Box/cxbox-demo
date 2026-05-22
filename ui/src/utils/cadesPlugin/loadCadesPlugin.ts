let promise: Promise<void> | null = null

export function loadCadesPlugin(): Promise<void> {
    if (promise) {
        return promise
    }

    promise = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = `${process.env.PUBLIC_URL}/cadesplugin_api.js`
        script.async = true

        script.onload = async () => {
            if (window.cadesplugin && typeof window.cadesplugin.catch === 'function') {
                window.cadesplugin.catch(() => {})
            }

            try {
                await window.cadesplugin
                resolve()
            } catch (e) {
                promise = null
                script.remove()
                reject(e)
            }
        }

        script.onerror = () => {
            promise = null
            script.remove()
            reject(new Error('Failed to load cadesplugin_api.js'))
        }

        document.head.appendChild(script)
    })

    return promise
}
