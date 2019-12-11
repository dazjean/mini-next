'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _watchpack = require('watchpack');

var _watchpack2 = _interopRequireDefault(_watchpack);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pageInit = require('./pageInit');

var _run = require('./webpack/run');

var _run2 = _interopRequireDefault(_run);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pagesDir = _path2.default.join(process.cwd() + '/src/pages');


var wp = new _watchpack2.default({
    // options:
    aggregateTimeout: 1000,
    // fire "aggregated" event when after a change for 1000ms no additional change occurred
    // aggregated defaults to undefined, which doesn't fire an "aggregated" event

    poll: true,
    // poll: true - use polling with the default interval
    // poll: 10000 - use polling with an interval of 10s
    // poll defaults to undefined, which prefer native watching methods
    // Note: enable polling when watching on a network path

    ignored: /node_modules/
    // anymatch-compatible definition of files/paths to be ignored
    // see https://github.com/paulmillr/chokidar#path-filtering
});

var WatchPages = function () {
    function WatchPages(app) {
        (0, _classCallCheck3.default)(this, WatchPages);

        this.watchPages = wp;
        this.app = app;
        this.startWathc();
    }

    (0, _createClass3.default)(WatchPages, [{
        key: 'startWathc',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var App, listOfDirectories, Directories;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                App = this.app;
                                listOfDirectories = [];
                                _context.next = 4;
                                return (0, _pageInit.readClientPages)();

                            case 4:
                                Directories = _context.sent;

                                Directories.forEach(function (cateName) {
                                    var pageMain = pagesDir + '/' + cateName;
                                    listOfDirectories.push(pageMain);
                                });
                                wp.watch([], listOfDirectories, Date.now() - 10000);
                                wp.on('aggregated', function (knownFiles) {
                                    // changes: an array of all changed files
                                    var dynamicRoutedPages = [];
                                    var _iteratorNormalCompletion = true;
                                    var _didIteratorError = false;
                                    var _iteratorError = undefined;

                                    try {
                                        for (var _iterator = (0, _getIterator3.default)(knownFiles), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                            var fileName = _step.value;

                                            var pageName = '/' + _path2.default.relative(pagesDir, fileName).replace(/\\+/g, '/');
                                            pageName = pageName.replace(/^\//, '');

                                            dynamicRoutedPages.push(pageName);
                                        }
                                    } catch (err) {
                                        _didIteratorError = true;
                                        _iteratorError = err;
                                    } finally {
                                        try {
                                            if (!_iteratorNormalCompletion && _iterator.return) {
                                                _iterator.return();
                                            }
                                        } finally {
                                            if (_didIteratorError) {
                                                throw _iteratorError;
                                            }
                                        }
                                    }

                                    console.log('watch ....');
                                    new _run2.default(dynamicRoutedPages, App);
                                });

                            case 8:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function startWathc() {
                return _ref.apply(this, arguments);
            }

            return startWathc;
        }()
    }, {
        key: 'stopWatch',
        value: function stopWatch() {
            wp.close();
        }
    }]);
    return WatchPages;
}();

module.exports = WatchPages;