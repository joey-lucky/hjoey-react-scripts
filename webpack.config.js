let config = require("./config/webpack.config");
let devServer = require("./config/webpackDevServer.config");


module.exports = {
    ...config,
    devServer:devServer,
};

