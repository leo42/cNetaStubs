const path = require('path');
const argv = require('yargs').argv;
const isProduction = argv.mode === 'production';
const CopyWebpackPlugin = require('copy-webpack-plugin');

var webAppConfig = {
	entry: './src/index.tsx', // Change entry point to .tsx
	output: {
		crossOriginLoading: 'anonymous',
		filename: 'bundle.js',
		path: path.join(__dirname, 'build/public')
	},
	devServer: {
		static: {
		  directory: path.join(__dirname, 'build/public'),
		},
		compress: true,
		port: 8080,
		allowedHosts : ["localhost" , "test.broclan.io"]
	},
	module: {
		rules: [
			{
				test: /\.svg$/,
				use: ['@svgr/webpack', 'svg-url-loader'],
			},
			{
				test: /\.tsx?$/, // Add TypeScript files to babel-loader
				use: 'ts-loader', // Use ts-loader for TypeScript files
				exclude: /node_modules/
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'], // Add .tsx and .ts as resolvable extensions
	},
	mode : isProduction ? 'production' : 'development',
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'src/html', to: '' },
			],
		}),
	],
	devtool : 'source-map',
	optimization: {
		usedExports: true,
	},
	experiments: {
		asyncWebAssembly: true,
		topLevelAwait: true,
		layers: true // optional, with some bundlers/frameworks it doesn't work without
	}
};

module.exports = [webAppConfig];