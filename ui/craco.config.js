const CracoLessPlugin = require('craco-less')

const lessModifyVars = {}

module.exports = {
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                cssLoaderOptions: {
                    modules: {
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
            },
            /**
             * Only relevant when applying some dependecies (e.g. @cxbox-ui/core) via symlinks,
             * so if you are not working on fixing @cxbox-ui/core it can safely be removed
             *
             * TODO: Revise after https://github.com/facebook/create-react-app/pull/7993
             */
            resolve: {
                symlinks: false
            }
        }
    }
}
