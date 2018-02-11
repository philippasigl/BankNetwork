var webpack = require('webpack');  
module.exports = {  
  entry: [
    "./jsx/app.js"
  ],
  output: {
    path: __dirname + '/static',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react','stage-2']
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
  ]
};