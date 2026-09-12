/**
 * Combines parts of URLs, ensuring that there is only one slash between them.
 * @param paths
 * @returns
 */
export function joinPaths(...paths: string[]): string {
    return paths
        .filter(Boolean)
        .map((path, index) => {
            let processed = path

            const isFirst = index === 0
            if (!isFirst) {
                processed = processed.replace(/^\/+/, '')
            }

            const isLast = index === paths.length - 1
            if (!isLast) {
                processed = processed.replace(/\/+$/, '')
            }

            return processed
        })
        .join('/')
}
