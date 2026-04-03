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
                // Disabling strict verification of ESM extensions
                oneOfRule.oneOf.unshift({
                    test: /\.m?js$/,
                    resolve: {
                        fullySpecified: false
                    }
                })

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

            // Disable build crash because "export 'useId' was not found in 'react'"
            // This works globally for all files processed by webpack parser.
            webpackConfig.module.rules.push({
                test: /\.m?js$/,
                parser: {
                    exportsPresence: false
                }
            })

            // Fallback for Node.js modules
            webpackConfig.resolve = {
                ...webpackConfig.resolve,
                fallback: {
                    ...webpackConfig.resolve?.fallback,
                    fs: false,
                    process: false,
                    path: false,
                    url: false
                }
            }

            return webpackConfig
        }
    }
}
