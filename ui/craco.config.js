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
        configure: (webpackConfig, { env, paths }) => {
            /**
             * Fix source map of external dependencies (including @cxbox-ui/core)
             *
             * TODO: Remove when https://github.com/facebook/create-react-app/pull/8227 released
             */
            webpackConfig.module.rules.push({
                test: /\.(js|css)$/,
                use: ['source-map-loader'],
                enforce: 'pre'
            })

            const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf)

            if (oneOfRule) {
                // Add our rule for the worker to the very beginning of the 'oneOf'.
                // This ensures that Webpack will handle the '.worker.min.js' as a resource (just copy),
                // before it gets to the standard rule for '.js' files that tries to bundle them.
                oneOfRule.oneOf.unshift({
                    test: /\.worker\.min\.js$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'static/js/[name].[contenthash][ext]'
                    }
                })
            }

            return webpackConfig
        }
    }
}
