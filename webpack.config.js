const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/homekit-dashboard.js',
  output: {
    filename: 'homekit-dashboard.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
