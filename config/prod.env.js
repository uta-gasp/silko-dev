const isPublishedDev = process.argv[2] === 'dev';
const url = isPublishedDev ? '"/silko-dev"' : '"/silko"';
console.log( `Setting up for ${url}, database is ${isPublishedDev ? 'DEV' : 'PROD'}` );

module.exports = {
  NODE_ENV: '"production"',
  URL_PATH: url,
  IS_DEV_DB: isPublishedDev,
}
