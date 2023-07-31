/**
 * Convert string to RegExp
 *
 * @param str Source string
 */
export function escapedSrc(str: string) {
    /* eslint-disable-next-line */
    return new RegExp(`(${str?.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')})`, 'gi')
}
