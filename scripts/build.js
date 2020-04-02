'use strict';
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const webpack = require('webpack');
const config = require('../config/webpack.config');

process.on('unhandledRejection', err => {
  throw err;
});

try{
    const compiler = webpack(config);
    compiler.run((err, stats) => {
        if (err) {
            return console.error(err);
        }
        console.log(stats.toString({
            chunks: false,  // 使构建过程更静默无输出
            children: false,
            colors: true    // 在控制台展示颜色
        }));
    });
}catch (e) {
    process.exit(1);
    return console.error(e);
}
