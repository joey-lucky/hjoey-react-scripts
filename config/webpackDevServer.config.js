'use strict';
const express = require("express");
const {publicPath, buildPath, devServer} = require("./paths");

module.exports = {
    host: "0.0.0.0",
    port: devServer.port,
    publicPath: publicPath,
    hot: true,
    contentBase: buildPath,
    historyApiFallback: {
        verbose: true,
        rewrites: [
            {
                from: new RegExp("^" + publicPath),
                to: publicPath + "index.html"
            },
        ]
    },
    disableHostCheck: true,
    open: true,
    openPage: publicPath.substr(1),
    allowedHosts: devServer.allowedHosts,
    before(app) {
        Object.keys(devServer.staticProxy).forEach(key => {
            app.use(key, express.static(devServer.staticProxy[key]));
        })
    },
    proxy: devServer.apiProxy,
    useLocalIp: true,
    index: "/index.html",
};
