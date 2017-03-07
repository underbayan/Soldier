'use strict'
var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var sassImporter = require('node-sass-import-once')

module.exports = function (env) {
    var devToolConfig = false
    var isSourceMap
    var isHash = ''
    var outputPath = ''
    var publickPath=""
    var htmlPlugins = []
    var plugins = []
    var entry
    var externalCdn
    var isProduction = function () {
        return process && process.env.NODE_ENV === 'production'
    }
    var htmlCreator = function (list) {
        var TEM_PATH = path.resolve(__dirname, 'src/templates')
        return list.map(function (o) {
            var h = new HtmlWebpackPlugin({
                template: path.resolve(TEM_PATH, o + '.html'),
                filename: o + '.html',
                chunks: ['prefix', o + ''],
                chunksSortMode: function (a, b) {
                    if (a.entry !== b.entry) {
                        return b.entry ? 1 : -1;
                    } else {
                        return b.id - a.id;
                    }
                },
                inject: 'body'
            })
            return h
        })
    }

    entry = {
        index: ['./src/pages/index'],
    }
    htmlPlugins = htmlCreator(['index'])
    var CommonPlugins = [
        new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
        new webpack.IgnorePlugin(/^\.\/lang$/, /moment$/),
        new webpack.ProvidePlugin({
            React: 'react',
            ReactDOM: 'react-dom',
        }),
        new webpack.LoaderOptionsPlugin({
            // test: /\.xxx$/, // may apply this only for some modules
            options: {
                sassLoader: {
                    includePaths: [
                        path.resolve(__dirname, './src')]
                },
                sassConfig: {
                    importer: sassImporter
                },
                context: '/'
            }
        })

    ]
    var optimizePlugins = [
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.optimize.MinChunkSizePlugin({
            compress: {
                warnings: false
            }
            , sourceMap: false
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
        new webpack.optimize.AggressiveMergingPlugin({
            minSizeReduce: 1.5,
            moveToParents: true
        }),
    ]
    if (isProduction()) {
        devToolConfig = false
        isSourceMap = false
        isHash = true ? '' : '.[hash:8]'
        plugins = plugins.concat(optimizePlugins)
    }
    else {
        devToolConfig = 'eval'//'cheap-module-source-map'
        isSourceMap = true
        publickPath="http://localhost:5489/build/"
        var hotServerReplace = 'webpack-hot-middleware/client?path=http://localhost:9991/__webpack_hmr'
        for (var o in entry) {
            entry[o] = [hotServerReplace].concat(entry[o])
        }
        plugins.push(new webpack.HotModuleReplacementPlugin())

    }
    plugins = plugins.concat(CommonPlugins)
    plugins = plugins.concat(htmlPlugins)

    var config = {
        devtool: devToolConfig,
        entry: entry,
        output: {
            path: path.resolve(__dirname, './build/' + outputPath),
            filename: '[name]' + isHash + '.js',
            chunkFilename: 'chunk_[name]' + isHash + '.js',
            publicPath: publickPath,
            libraryTarget: 'umd',
            library: 'hachi'
        },
        resolve: {
            extensions: ['.webpack.js', '.web.js', '.js', '.jsx', '.scss'],
            modules: [
                './',
                'src',
                'src/utils',
                'src/lib',
                'spec',
                'node_modules',
            ],
        },
        externals: externalCdn,
        plugins: plugins,
        module: {
            loaders: [
                {
                    test: /\.json$/,
                    loader: 'json-loader'
                },
                {
                    test: /\.js$/,
                    loader: 'babel-loader?compact=false!eslint-loader!eslint-loader',//!eslint-loader
                },
                {
                    test: /\.css$/,
                    loader: 'style-loader!css-loader?minimize&name=style/[name]' + isHash + '.[ext]&importLoaders=1&sourceMap=' + isSourceMap + '!postcss-loader'
                },
                {
                    test: /\.(ttf|eot|svg|woff|woff2|)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: 'file-loader?name=fonts/[name]' + isHash + '.[ext]'
                },
                {
                    test: /\.(png|jpeg|jpg|tiff|bmp|)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: 'file-loader?name=img/[name]' + isHash + '.[ext]'
                },
                {
                    test: /.scss$/,
                    loaders: ['style-loader', 'css-loader?minimize&sourceMap=' + isSourceMap, 'postcss-loader', 'sass-loader?name=style/[name].[ext]&sourceMap=' + isSourceMap]
                }

            ]
        },

    }
    return config
}

