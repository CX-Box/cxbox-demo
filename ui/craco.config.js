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
