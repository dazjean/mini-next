'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadGetInitialProps = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var loadGetInitialProps = exports.loadGetInitialProps = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(App, ctx) {
        var message, res, props, _message;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(process.env.NODE_ENV !== 'production')) {
                            _context.next = 4;
                            break;
                        }

                        if (!(App.prototype && App.prototype.getInitialProps)) {
                            _context.next = 4;
                            break;
                        }

                        message = '"' + getDisplayName(App) + '.getInitialProps(ctx ,query,pathname)" is defined as an instance method - visit https://err.sh/zeit/next.js/get-initial-props-as-an-instance-method for more information.';
                        throw new Error(message);

                    case 4:
                        // when npm run output ctx is null
                        ctx = ctx || {};

                        // when called from _app `ctx` is nested in `ctx`
                        res = ctx.res || ctx.ctx && ctx.ctx.res;

                        if (App.getInitialProps) {
                            _context.next = 13;
                            break;
                        }

                        if (!(ctx.ctx && ctx.Component)) {
                            _context.next = 12;
                            break;
                        }

                        _context.next = 10;
                        return loadGetInitialProps(ctx.Component, ctx.ctx);

                    case 10:
                        _context.t0 = _context.sent;
                        return _context.abrupt('return', {
                            pageProps: _context.t0
                        });

                    case 12:
                        return _context.abrupt('return', {});

                    case 13:
                        _context.next = 15;
                        return App.getInitialProps(ctx, ctx.params && ctx.params.query || null, ctx.params && ctx.params.pathname || null);

                    case 15:
                        props = _context.sent;

                        if (!(res && (0, _utils.isResSent)(res))) {
                            _context.next = 18;
                            break;
                        }

                        return _context.abrupt('return', props);

                    case 18:
                        if (props) {
                            _context.next = 21;
                            break;
                        }

                        _message = '"' + getDisplayName(App) + '.getInitialProps()" should resolve to an object. But found "' + props + '" instead.';
                        throw new Error(_message);

                    case 21:

                        if (process.env.NODE_ENV !== 'production') {
                            if ((0, _keys2.default)(props).length === 0 && !ctx.ctx) {
                                console.warn(getDisplayName(App) + ' returned an empty object from `getInitialProps`. This de-optimizes and prevents automatic static optimization');
                            }
                        }

                        return _context.abrupt('return', props);

                    case 23:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function loadGetInitialProps(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

exports.getDisplayName = getDisplayName;

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDisplayName(Component) {
    return typeof Component === 'string' ? Component : Component.displayName || Component.name || 'Unknown';
}