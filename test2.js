const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// 手动打印请求地址和参数
app.use((req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    console.log(`Request Method: ${req.method}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log(`Request Body: ${JSON.stringify(req.body)}`);
    }
    next();
});

// 设置代理中间件
app.use('/api', createProxyMiddleware({
    target: 'https://www.okx.com',
    // target: 'https://www.baidu.com',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('OK-ACCESS-KEY', req.headers['ok-access-key']);
        proxyReq.setHeader('OK-ACCESS-SIGN', req.headers['ok-access-sign']);
        proxyReq.setHeader('OK-ACCESS-TIMESTAMP', req.headers['ok-access-timestamp']);
        proxyReq.setHeader('OK-ACCESS-PASSPHRASE', req.headers['ok-access-passphrase']);
    }
}));

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
