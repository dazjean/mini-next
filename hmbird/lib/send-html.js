'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.sendHTML = sendHTML;

var _etag = require('etag');

var _etag2 = _interopRequireDefault(_etag);

var _fresh = require('fresh');

var _fresh2 = _interopRequireDefault(_fresh);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sendHTML(ctx, html, _ref) {
    var generateEtags = _ref.generateEtags;
    var req = ctx.req,
        res = ctx.res;

    if ((0, _utils.isResSent)(res)) return;
    var etag = generateEtags ? (0, _etag2.default)(html) : undefined;

    if ((0, _fresh2.default)(req.headers, { etag: etag })) {
        res.statusCode = 304;
        res.end();
        return;
    }

    if (etag) {
        res.setHeader('ETag', etag);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Length', Buffer.byteLength(html));
    res.end(req.method === 'HEAD' ? null : html);
}