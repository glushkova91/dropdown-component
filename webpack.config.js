const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const extractCss = new MiniCssExtractPlugin({
    filename: '[name].css'
});

module.exports = {
    entry: {
        bundle: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    plugins: [extractCss],
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: 'babel-loader'
        }, {
            test: /(\.css)$/,
            exclude: /node_modules/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
        }]
    }
};