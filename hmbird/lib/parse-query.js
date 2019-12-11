'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseQuery = undefined;

var _url = require('url');

// import { parse as parseQs } from 'querystring';

var parseQuery = exports.parseQuery = function parseQuery(req) {
    var url = req.url;
    var parsedUrl = (0, _url.parse)(url, true);
    return parsedUrl;
};