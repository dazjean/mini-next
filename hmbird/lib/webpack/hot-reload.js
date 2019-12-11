'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _webpackDevMiddleware = require('webpack-dev-middleware');
var _webpackHotMiddleware = require('webpack-hot-middleware');

var HotReload = function () {
    function HotReload(app, complier) {
        (0, _classCallCheck3.default)(this, HotReload);

        this.app = app;
        this.complier = complier;
        this.webpackDevMiddleware();
        this.webpackHotMiddleware();
    }

    (0, _createClass3.default)(HotReload, [{
        key: 'webpackHotMiddleware',
        value: function webpackHotMiddleware() {
            var hotMiddleware = _webpackHotMiddleware(this.complier, {
                log: false,
                heartbeat: 2000
            });
            this.app.use(hotMiddleware);
        }
    }, {
        key: 'webpackDevMiddleware',
        value: function webpackDevMiddleware() {
            var devMiddleware = _webpackDevMiddleware(this.complier, {
                publicPath: '/',
                serverSideRender: false,
                quiet: true //向控制台显示任何内容
            });
            this.app.use(devMiddleware);
        }
    }]);
    return HotReload;
}();

module.exports = HotReload;