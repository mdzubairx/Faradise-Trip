const path = require('path');

module.exports = {
  entry: {
    listingDisplayMap : './public/js/listingDisplayMap.js',
    listingInputMap : './public/js/listingInputMap.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public/js'),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
