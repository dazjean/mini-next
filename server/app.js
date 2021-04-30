/* * @Author: zhang dajia * @Date: 2018-11-05 14:16:55
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2019-12-10 11:09:21
 * @Last  description: undefined
 */
import Koa from 'koa';
import miniNext from '../mini-next/src';
const app = new Koa();

new miniNext(app);

app.listen(8001);

// eslint-disable-next-line no-console
console.log('app started at port 8001...');
