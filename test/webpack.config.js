'use strict';

const webpack = require( 'webpack' );
const path = require( 'path' );

const NODE_ENV = process.env.NODE_ENV || 'development';
const TYPE = process.env.TYPE || 'lib';
const isDev = NODE_ENV === 'development';
const suffix = (TYPE === 'lib' ?  '' : '.module') +
				(isDev ? '' : '.min') +
				'.js'

module.exports = {
	context: path.resolve( __dirname, ".." ),
	entry: './test/utils/dataCollection.js',
	output: {
		path: path.resolve( __dirname ),
		filename: 'utils/index.js'
	},

	module: {
	  rules: [
	    { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
	  ]
	}
};
