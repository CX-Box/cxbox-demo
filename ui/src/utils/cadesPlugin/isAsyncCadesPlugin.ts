export function isAsyncCadesPlugin(plugin: CADESPlugin): plugin is CADESPluginAsync {
    return 'CreateObjectAsync' in plugin
}
