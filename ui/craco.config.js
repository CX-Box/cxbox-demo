const CracoLessPlugin = require('craco-less')
const { CracoAliasPlugin } = require('react-app-alias')

const lessModifyVars = {}

module.exports = {
    plugins: [
        {
            plugin: CracoAliasPlugin,
            options: {}
        },
        {
            plugin: CracoLessPlugin,
            options: {
                cssLoaderOptions: {
                    modules: {
                        auto: resourcePath => !resourcePath.includes('node_modules'),
                        localIdentName: '[name]__[local]___[hash:base64:5]'
                    }
                },
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: lessModifyVars,
                        javascriptEnabled: true
                    }
                }
            }
        }
    ],
    webpack: {
        configure: {
            module: {
                rules: [
                    /**
                     * Fix source map of external dependencies (including @cxbox-ui/core)
                     *
                     * TODO: Remove when https://github.com/facebook/create-react-app/pull/8227 released
                     */
                    {
                        test: /\.(js|css)$/,
                        use: ['source-map-loader'],
                        enforce: 'pre'
                    }
                ]
            }
        }
    }
}
