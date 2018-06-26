'use strict';

const webpack = require( 'webpack' );
const path = require( 'path' );

module.exports = {
	context: path.resolve( __dirname, 'test' ),
	entry: './utils/dataCollection.js',
	output: {
		filename: './test/utils/index.js'
	},

	module: {
	  rules: [
	    { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
	  ]
	}
};
