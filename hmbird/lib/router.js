'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _pageInit = require('./pageInit');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _koaSend = require('koa-send');

var _koaSend2 = _interopRequireDefault(_koaSend);

var _sendHtml = require('./send-html');

var _parseQuery = require('./parse-query');

var _renderServerStatic = require('./render-server-static');

var _utils = require('./utils');

var _watch = require('./watch');

var _watch2 = _interopRequireDefault(_watch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * @Author: zhang dajia * @Date: 2018-11-05 14:16:25
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2019-12-10 11:11:08
 * @Last  description: hmbird-router
 */
var publicPath = _path2.default.join(process.cwd() + '/dist/client');
var pagePath = _path2.default.join(process.cwd() + '/src/pages');

function normalizePagePath(page) {
    // If the page is `/` we need to append `/index`, otherwise the returned directory root will be bundles instead of pages
    // Resolve on anything that doesn't start with `/`
    if (page[0] !== '/') {
        page = '/' + page;
    }
    // Throw when using ../ etc in the pathname
    var resolvedPage = _path2.default.posix.normalize(page);
    if (page !== resolvedPage) {
        throw new Error('Requested and resolved page mismatch');
    }
    return page;
}

var RegisterClientPages = function () {
    function RegisterClientPages(app, dev) {
        (0, _classCallCheck3.default)(this, RegisterClientPages);

        this.router = new _koaRouter2.default();
        this.app = app;
        this.dev = dev || process.env.NODE_ENV !== 'production';
        this.config = (0, _utils.getConfig)(app);
        this.registerPages();
        this.serverStatic();
        this.watchPage();
    }

    (0, _createClass3.default)(RegisterClientPages, [{
        key: 'watchPage',
        value: function watchPage() {
            this.dev && new _watch2.default(this.app);
        }
    }, {
        key: 'registerPages',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var _this = this;

                var pages;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return (0, _pageInit.readClientPages)();

                            case 2:
                                pages = _context.sent;

                                pages.forEach(function (page) {
                                    var pageMain = _path2.default.join(pagePath, normalizePagePath(page + '/' + page + '.js'));
                                    if (_fs2.default.existsSync(pageMain) //是否存在入口文件
                                    ) {
                                            _this.pushRouter(page);
                                        }
                                });
                                this.app.use(this.router.routes());
                                this.app.use(this.router.allowedMethods());

                            case 6:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function registerPages() {
                return _ref.apply(this, arguments);
            }

            return registerPages;
        }()
    }, {
        key: 'serverStatic',
        value: function serverStatic() {
            var _this2 = this;

            this.app.use(function () {
                var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(ctx, next) {
                    var staticStatus, stats, urlpath;
                    return _regenerator2.default.wrap(function _callee2$(_context2) {
                        while (1) {
                            switch (_context2.prev = _context2.next) {
                                case 0:
                                    staticStatus = void 0, stats = void 0;
                                    urlpath = _path2.default.join(publicPath, normalizePagePath(ctx.path));
                                    _context2.prev = 2;

                                    stats = _fs2.default.statSync(urlpath);
                                    _context2.next = 9;
                                    break;

                                case 6:
                                    _context2.prev = 6;
                                    _context2.t0 = _context2['catch'](2);
                                    return _context2.abrupt('return', next());

                                case 9:
                                    if (!(stats && stats.isFile())) {
                                        _context2.next = 19;
                                        break;
                                    }

                                    _context2.prev = 10;
                                    _context2.next = 13;
                                    return (0, _koaSend2.default)(ctx, ctx.path, { root: publicPath });

                                case 13:
                                    staticStatus = _context2.sent;
                                    _context2.next = 19;
                                    break;

                                case 16:
                                    _context2.prev = 16;
                                    _context2.t1 = _context2['catch'](10);
                                    return _context2.abrupt('return', next());

                                case 19:
                                    if (!(staticStatus == undefined)) {
                                        _context2.next = 22;
                                        break;
                                    }

                                    _context2.next = 22;
                                    return next();

                                case 22:
                                case 'end':
                                    return _context2.stop();
                            }
                        }
                    }, _callee2, _this2, [[2, 6], [10, 16]]);
                }));

                return function (_x, _x2) {
                    return _ref2.apply(this, arguments);
                };
            }());
        }
    }, {
        key: 'pushRouter',
        value: function pushRouter(page) {
            var _this3 = this;

            var rePath = new RegExp('^/' + page + '(/?.*)'); // re为/^\d+bl$
            var prefixRouter = this.config.prefixRouter;

            if (prefixRouter != '') {
                rePath = new RegExp('^/' + prefixRouter + '/' + page + '(/?.*)'); // re为/^\d+bl$
            }
            console.log('register router:' + rePath);
            this.router.get(rePath, function () {
                var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(ctx, next) {
                    var parseQ, pageName, document;
                    return _regenerator2.default.wrap(function _callee3$(_context3) {
                        while (1) {
                            switch (_context3.prev = _context3.next) {
                                case 0:
                                    parseQ = (0, _parseQuery.parseQuery)(ctx);
                                    pageName = parseQ.pathname.replace('/' + prefixRouter, '').replace(/^\//, '').split('/')[0];

                                    ctx.hmbirdconfig = _this3.config;

                                    if (!(pageName == page)) {
                                        _context3.next = 13;
                                        break;
                                    }

                                    ctx.params.pagename = page;
                                    ctx.params.query = parseQ.query;
                                    ctx.params.pathname = parseQ.pathname.replace(new RegExp('^/' + pageName + '(/?)'), '');
                                    _context3.next = 9;
                                    return (0, _renderServerStatic.renderServerStatic)(ctx);

                                case 9:
                                    document = _context3.sent;

                                    _this3.renderHtml(ctx, document);
                                    _context3.next = 15;
                                    break;

                                case 13:
                                    _context3.next = 15;
                                    return next();

                                case 15:
                                case 'end':
                                    return _context3.stop();
                            }
                        }
                    }, _callee3, _this3);
                }));

                return function (_x3, _x4) {
                    return _ref3.apply(this, arguments);
                };
            }());
        }
    }, {
        key: 'render404',
        value: function render404(ctx, path) {
            ctx.body = 'not found:' + path.pathname;
        }
    }, {
        key: 'renderError',
        value: function renderError(ctx, path, err) {
            ctx.body = 'service error:' + path.pathname + '\n' + err;
        }
    }, {
        key: 'renderHtml',
        value: function renderHtml(ctx, html) {
            (0, _sendHtml.sendHTML)(ctx, html, { generateEtags: true });
        }
    }]);
    return RegisterClientPages;
}();

module.exports = RegisterClientPages;