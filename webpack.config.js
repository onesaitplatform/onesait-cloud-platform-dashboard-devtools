const path = require('path');
var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const { readdirSync, writeFileSync, statSync } = require('fs')

const getDirectories = source =>
    readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
            return {
                id : dirent.name.split("(")[0],
                identification : dirent.name.split("(")[1].slice(0,-1),
                idpath : dirent.name
            }
        }
    )

var dashboards = getDirectories("src");

var Plugins = [new CleanWebpackPlugin()]

Plugins.push(new HtmlWebpackPlugin(
    {
        title: "Dev Dashboard Index",
        filename: "index.html",
        dashboards: dashboards.map(dashboard => `<br/><a href="${dashboard.id}/">${dashboard.identification}</a>`),
        inject: false,
        template: './dev/templates/index.html.ejs'
    }));

dashboards.forEach(
    dashboard => Plugins.push(new HtmlWebpackPlugin(
        {
            title: "Dev " + dashboard,
            filename: dashboard.id + "/index.html",
            id: dashboard.id,
            idpath: dashboard.idpath,
            inject: false,
            template: './dev/templates/view.html.ejs'
        }))
)

Plugins.push(
    new webpack.HotModuleReplacementPlugin()
)

Plugins.push(new CopyPlugin([
    { from: './dev/local-libs', to: 'local-libs' },
    { from: './dev/local-resources/dashboards', to: 'controlpanel/static/images/dashboards' },
    { from: './dev/local-resources/soho', to: 'font/soho' }
].concat(dashboards.flatMap(
    dashboard => {
        console.log(`./models/downloaded/${dashboard.identification}.json`)
        console.log(`models/${dashboard.id}`)
        return [
            {'from': `./src/${dashboard.idpath}/**/*`, to: `${dashboard.id}/templates/`,flatten: true},
            {'from': `./src/${dashboard.idpath}/data.json`, to: `${dashboard.id}/datamock/data.json`},
            {'from': `./models/downloaded/${dashboard.identification}.json`, to: `models/${dashboard.id}.json` }
        ]
    }
))
));

var requires = ""

function walkAndSet(dir) {
    let files = readdirSync(dir);
    files.map(file => {
        const filePath = path.join(dir, file);
        const stats = statSync(filePath);
        if (stats.isDirectory()) return walkAndSet(filePath);
        else if(stats.isFile()) {
            requires += "require('../" + filePath.replace(/\\/g,"\/") + "');\n"; 
        };
    });
}

writeFileSync(
    path.join("src","index.js"),
    requires
)

console.log(requires);

module.exports = {
    mode: 'development',
    entry: {
        app: './src/index.js',
        templates: ['webpack-hot-middleware/client?reload=true&path=/__webpack_hmr&timeout=20000', './src/'],
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: '../src',
        hot: true,
        watchContentBase: true
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                exclude: /headerLibs\.html$/,
                use: [
                    {
                        loader: 'raw-loader',
                        options: {
                            esModule: false,
                        },
                    },
                ],
            },
            {
                test: /\.html$/,
                include: /headerLibs\.html$/,
                use: [
                    {
                        loader: 'html-loader'
                    },
                ],
            }
        ]
    },
    plugins: Plugins
    ,
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    }
};