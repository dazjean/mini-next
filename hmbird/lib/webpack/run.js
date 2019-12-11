'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _proconfig = require('./proconfig');

var _devconfig = require('./devconfig');

var _hotReload = require('./hot-reload');

var _hotReload2 = _interopRequireDefault(_hotReload);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var clientPath = _path2.default.join(process.cwd() + '/dist/client');

var Webpack = function () {
    function Webpack(pages, app) {
        (0, _classCallCheck3.default)(this, Webpack);

        var pageName = pages.join(',');
        this.app = app;
        this.config = this.getWebpackConfig(pageName, true);
        this.Compiler = (0, _webpack2.default)(this.config);
        this.run(pageName);
        //this.hotReload();
    }

    (0, _createClass3.default)(Webpack, [{
        key: 'getWebpackConfig',
        value: function getWebpackConfig(pageName, dev) {
            if (dev) {
                return (0, _devconfig.getDevconfig)(pageName, true);
            } else {
                return (0, _proconfig.getProconfig)(pageName, true);
            }
        }
    }, {
        key: 'run',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(pagename) {
                var callback, pagefile;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this.compilerRun();

                            case 2:
                                callback = _context.sent;

                                if (callback === true) {
                                    pagefile = clientPath + '/' + pagename + '/' + pagename + '.js';

                                    this.clearRequireCache(pagefile);
                                }

                            case 4:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function run(_x) {
                return _ref.apply(this, arguments);
            }

            return run;
        }()
    }, {
        key: 'compilerRun',
        value: function compilerRun() {
            var _this = this;

            return new _promise2.default(function (resove, reject) {
                //this.hotReload(Compiler);
                _this.Compiler.run(function (err, stats) {
                    if (err) {
                        reject(err.stack);
                    }
                    var info = stats.toJson();
                    if (stats.hasErrors()) {
                        console.error(info.errors);
                        reject(info.errors);
                        return;
                    }
                    //处理代码编译中产生的warning
                    if (stats.hasWarnings()) {
                        console.warn(info.warnings);
                    }
                    resove(true);
                });
            });
        }
    }, {
        key: 'webpackCallback',
        value: function webpackCallback(err, stats) {
            console.log(stats.toString({
                chunks: false,
                colors: true
            }));
            console.log('compiler....ok!');
        }
    }, {
        key: 'hotReload',
        value: function hotReload(compiler) {
            new _hotReload2.default(this.app, compiler || this.Compiler);
        }
    }, {
        key: 'clearRequireCache',
        value: function clearRequireCache(moduleFilename) {
            delete require.cache[moduleFilename];
        }
    }]);
    return Webpack;
}();

module.exports = Webpack;