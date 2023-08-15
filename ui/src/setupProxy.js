const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
    app.use(
        '/api/v1',
        createProxyMiddleware({
            host: '[::1]',
            target: 'http://localhost:8080'
        })
    )
}
