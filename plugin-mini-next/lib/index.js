"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('@babel/register')({
    presets: ['@babel/env', '@babel/react']
});
require("core-js/stable");
require("regenerator-runtime/runtime");
const MiniNext = require('mini-next');
exports.default = (uma) => {
    new MiniNext(uma.app);
};
