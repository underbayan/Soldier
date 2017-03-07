var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.js');
var opn = require('opn')
config = config();
var app = express();
var compiler = webpack(config);
app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: "http://localhost:5488/build"
}));
app.use(require('webpack-hot-middleware')(compiler));
app.get('/', function (req, res) {
    res.sendFile('/build/index.html');
});
app.listen(9991, '0.0.0.0', function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Listening at http://localhost:9991');
    opn('http://localhost:9991/build/')
});
