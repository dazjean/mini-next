/* * @Author: zhang dajia * @Date: 2018-11-05 14:16:55
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2019-11-22 19:08:39
 * @Last  description: undefined
 */
const Koa = require('koa');
const Hmbird = require('./server/lib/router');
const koaStatic = require('koa-static');
const app = new Koa();
app.use(koaStatic(__dirname + './../public'));
new Hmbird(app);
// 在端口8001监听:
app.listen(8001);
// eslint-disable-next-line no-console
console.log('app started at port 8001...');
