var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

const isProdDatabase = process.argv[2] === 'proddb';
console.log( `Database => ${isProdDatabase ? 'PROD' : 'DEV'}` );

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  URL_PATH: '""',
  IS_DEV_DB: !isProdDatabase,
})
