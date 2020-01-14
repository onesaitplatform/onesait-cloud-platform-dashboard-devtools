const path = require('path');
var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const { readdirSync, writeFileSync, statSync } = require('fs')

const getDirectories = source =>
    readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

var dashboards = getDirectories("src");

var Plugins = [new CleanWebpackPlugin()]

Plugins.push(new HtmlWebpackPlugin(
    {
        title: "Dev Dashboard Index",
        filename: "index.html",
        dashboards: dashboards.map(dashboard => `<br/><a href="${dashboard}/">${dashboard}</a>`),
        inject: false,
        template: './dev/templates/index.html.ejs'
    }));

dashboards.forEach(
    dashboard => Plugins.push(new HtmlWebpackPlugin(
        {
            title: "Dev " + dashboard,
            filename: dashboard + "/index.html",
            id: dashboard,
            inject: false,
            template: './dev/templates/view.html.ejs'
        }))
)

Plugins.push(
    new webpack.HotModuleReplacementPlugin()
)

Plugins.push(new CopyPlugin([
    { from: './dev/local-libs', to: 'local-libs' },
    { from: './models/downloaded', to: 'models' },
    { from: './dev/local-resources/dashboards', to: 'controlpanel/static/images/dashboards' },
    { from: './dev/local-resources/soho', to: 'font/soho' }
].concat(dashboards.flatMap(
    dashboard => { 
        return [
            {'from': `./src/${dashboard}/**/*`, to: `${dashboard}/templates/`,flatten: true},
            {'from': `./src/${dashboard}/data.json`, to: `${dashboard}/datamock/data.json`}
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

walkAndSet("src/Visualize OpenFlights Data");

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