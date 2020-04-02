'use strict';
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const devServerConfig = require('../config/webpackDevServer.config');
const config = require('../config/webpack.config');

process.on('unhandledRejection', err => {
    throw err;
});

try{
    let {port,host} = devServerConfig;
    let compiler = webpack(config);
    const devServer = new WebpackDevServer(compiler, devServerConfig);
    devServer.listen(port, host, err => {
        if (err) {
            return console.error(err);
        }
    });
}catch (err) {
    // process.exit(1);
    return console.error(err);
}
