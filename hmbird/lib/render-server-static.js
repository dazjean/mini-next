'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.renderServerStatic = exports.renderServerDynamic = exports.render = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _reactRouterDom = require('react-router-dom');

var _getStream = require('get-stream');

var _getStream2 = _interopRequireDefault(_getStream);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _getStaticProps = require('./get-static-props');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var outputPath = _path2.default.join(process.cwd() + '/_output');
var clientPath = _path2.default.join(process.cwd() + '/dist/client');

/**
 * 写入文件,存在则覆盖
 * @param {*} path 文件名称
 * @param {*} Content 内容
 */
var writeFile = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(path, Content) {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        return _context.abrupt('return', new _promise2.default(function (resolve) {
                            _fs2.default.writeFile(path, Content, { encoding: 'utf8' }, function (err) {
                                if (err) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                    console.log(path + '----Cache in server');
                                }
                            });
                        }));

                    case 1:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function writeFile(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

/**
 * 用Promise封装异步读取文件方法
 * @param  {string} page html文件名称
 * @return {promise}
 */
var render = exports.render = function render(pagename) {
    return new _promise2.default(function (resolve, reject) {
        var viewUrl = clientPath + '/' + pagename + '/' + pagename + '.html';
        _fs2.default.readFile(viewUrl, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

var writeFileHander = function writeFileHander(name, Content) {
    _fs2.default.exists(outputPath, function (exists) {
        if (exists) {
            writeFile(name, Content);
        } else {
            _fs2.default.mkdir(outputPath, function (err) {
                if (err) {
                    console.log(err.stack);
                } else {
                    writeFile(name, Content);
                }
            });
        }
    });
};

/**
 * Router类型页面渲染解析
 * @param {*} ctx
 * @param {*} next
 */
var renderServerDynamic = exports.renderServerDynamic = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(ctx) {
        var context, _ctx$params, pagename, pathname, query, App, pagefile, props, Html, Htmlstream, locationUrl, data, document;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        context = {};
                        _ctx$params = ctx.params, pagename = _ctx$params.pagename, pathname = _ctx$params.pathname, query = _ctx$params.query;
                        App = {};
                        pagefile = clientPath + '/' + pagename + '/' + pagename + '.js';

                        try {
                            // eslint-disable-next-line no-undef
                            App = require(pagefile);
                        } catch (error) {
                            // eslint-disable-next-line no-console
                            console.warn('place move  windows/location object into React componentDidMount(){} ', pagename);
                            console.warn(error.stack);
                        }
                        _context2.next = 7;
                        return (0, _getStaticProps.loadGetInitialProps)(App, ctx);

                    case 7:
                        props = _context2.sent;
                        Html = '';
                        Htmlstream = '';
                        locationUrl = ctx.request.url.split(pagename)[1];

                        try {
                            Htmlstream = _server2.default.renderToNodeStream(_react2.default.createElement(
                                _reactRouterDom.StaticRouter,
                                { location: locationUrl || '/', context: context },
                                _react2.default.createElement(App, (0, _extends3.default)({ pathname: pathname, query: query }, props))
                            ));
                        } catch (error) {
                            console.warn('服务端渲染异常，降级使用客户端渲染！');
                        }

                        if (!context.url) {
                            _context2.next = 17;
                            break;
                        }

                        ctx.response.writeHead(301, {
                            Location: context.url
                        });
                        ctx.response.end();
                        _context2.next = 32;
                        break;

                    case 17:
                        _context2.next = 19;
                        return render(pagename);

                    case 19:
                        data = _context2.sent;
                        _context2.prev = 20;
                        _context2.next = 23;
                        return (0, _getStream2.default)(Htmlstream);

                    case 23:
                        Html = _context2.sent;
                        _context2.next = 29;
                        break;

                    case 26:
                        _context2.prev = 26;
                        _context2.t0 = _context2['catch'](20);

                        console.warn('流转化字符串异常，降级使用客户端渲染！');

                    case 29:
                        // 把渲染后的 React HTML 插入到 div 中
                        document = data.replace(/<div id="app"><\/div>/, '<div id="app">' + Html + '</div>');

                        writeFileHander(outputPath + '/' + pagename + '.html', document); //缓存本地
                        return _context2.abrupt('return', document);

                    case 32:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined, [[20, 26]]);
    }));

    return function renderServerDynamic(_x3) {
        return _ref2.apply(this, arguments);
    };
}();

/**
 * 获取服务端渲染直出资源
 * @param {*} ctx
 */
var renderServerStatic = exports.renderServerStatic = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(ctx) {
        var pageName, _ctx$hmbirdconfig, ssrCache, ssrIngore, ssr, statiPages;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        pageName = ctx.params.pagename;
                        _ctx$hmbirdconfig = ctx.hmbirdconfig, ssrCache = _ctx$hmbirdconfig.ssrCache, ssrIngore = _ctx$hmbirdconfig.ssrIngore, ssr = _ctx$hmbirdconfig.ssr, statiPages = _ctx$hmbirdconfig.statiPages;
                        return _context5.abrupt('return', new _promise2.default(function () {
                            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(resolve) {
                                var viewUrl;
                                return _regenerator2.default.wrap(function _callee4$(_context4) {
                                    while (1) {
                                        switch (_context4.prev = _context4.next) {
                                            case 0:
                                                if (!(!ssr || ssrIngore && ssrIngore.test(pageName))) {
                                                    _context4.next = 6;
                                                    break;
                                                }

                                                _context4.t0 = resolve;
                                                _context4.next = 4;
                                                return render(pageName);

                                            case 4:
                                                _context4.t1 = _context4.sent;
                                                return _context4.abrupt('return', (0, _context4.t0)(_context4.t1));

                                            case 6:
                                                viewUrl = outputPath + '/' + pageName + '.html';

                                                if (!(!ssrCache && statiPages.indexOf(pageName) == -1)) {
                                                    _context4.next = 15;
                                                    break;
                                                }

                                                _context4.t2 = resolve;
                                                _context4.next = 11;
                                                return renderServerDynamic(ctx);

                                            case 11:
                                                _context4.t3 = _context4.sent;
                                                (0, _context4.t2)(_context4.t3);
                                                _context4.next = 16;
                                                break;

                                            case 15:
                                                _fs2.default.readFile(viewUrl, 'utf8', function () {
                                                    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(err, data) {
                                                        return _regenerator2.default.wrap(function _callee3$(_context3) {
                                                            while (1) {
                                                                switch (_context3.prev = _context3.next) {
                                                                    case 0:
                                                                        if (!err) {
                                                                            _context3.next = 9;
                                                                            break;
                                                                        }

                                                                        console.log('Immediate preparation static.....' + pageName);
                                                                        _context3.t0 = resolve;
                                                                        _context3.next = 5;
                                                                        return renderServerDynamic(ctx);

                                                                    case 5:
                                                                        _context3.t1 = _context3.sent;
                                                                        (0, _context3.t0)(_context3.t1);
                                                                        _context3.next = 11;
                                                                        break;

                                                                    case 9:
                                                                        console.log('ssrCache.....' + pageName);
                                                                        resolve(data);

                                                                    case 11:
                                                                    case 'end':
                                                                        return _context3.stop();
                                                                }
                                                            }
                                                        }, _callee3, undefined);
                                                    }));

                                                    return function (_x6, _x7) {
                                                        return _ref5.apply(this, arguments);
                                                    };
                                                }());

                                            case 16:
                                            case 'end':
                                                return _context4.stop();
                                        }
                                    }
                                }, _callee4, undefined);
                            }));

                            return function (_x5) {
                                return _ref4.apply(this, arguments);
                            };
                        }()));

                    case 3:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, undefined);
    }));

    return function renderServerStatic(_x4) {
        return _ref3.apply(this, arguments);
    };
}();