'use strict';
const path = require('path');
const fs = require('fs');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath="") => path.resolve(appDirectory, relativePath);
const packageJson = require(resolveApp("package.json"));
const {homepage, cdnHost, proxy, resolveAlias} = packageJson;

function getPort(url) {
    return url.replace(/(\S)+\:/g, "").replace(/\/(\S)+/g, "");
}

function getPath(url) {
    return url.replace(/(\S)+\:(\d)+/g, "");
}

function getHost(url) {
    return url.replace(getPath(url), "");
}

function getApiProxy(proxy = {}) {
    let result = {};
    Object.keys(proxy).forEach((key) => {
        let value = proxy[key] || "";
        if (value.startsWith("http")) {
            result[key] = {
                target: value,
                secure: false,
                changeOrigin: true,
            };
        }
    });
    return result;
}

function getStaticProxy(proxy = {}) {
    let result = {};
    Object.keys(proxy).forEach((key) => {
        let value = proxy[key];
        if (!value.startsWith("http")) {
            result[key] =value;
        }
    });
    return result;
}

function getAllowedHosts(proxy = {}) {
    let set = new Set();
    Object.keys(proxy).forEach((key) => {
        let value = proxy[key];
        if (value.startsWith("http")) {
            set.add(value);
        }
    });
    return Array.from(set);
}

function getResolveAlias(resolveAlias = {}) {
    let result = {};
    for (let key of Object.keys(resolveAlias)) {
        let value = resolveAlias[key];
        result[key] = resolveApp(value)
    }
    return result;
}

const paths = {
    resolveApp: resolveApp,
    srcPath: resolveApp("src"),
    buildPath: resolveApp("build"),
    publicPath: getPath(homepage),
    alias: getResolveAlias(resolveAlias),
    cdnHost: cdnHost,
    devServer: {
        host: getHost(homepage),
        port: getPort(homepage),
        apiProxy: getApiProxy(proxy),
        staticProxy: getStaticProxy(proxy),
        allowedHosts: getAllowedHosts(proxy),
        useLocalIp: getHost(homepage) === "0.0.0.0"
    }
};

module.exports = paths;
