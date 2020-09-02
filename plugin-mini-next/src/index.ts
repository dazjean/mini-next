import { Uma, TPlugin } from "@umajs/core";
require('@babel/register')({
    presets: ['@babel/env','@babel/react']
});
require( "core-js/stable");
require("regenerator-runtime/runtime");
const MiniNext = require('mini-next');

export type Options = {};

export default (uma: Uma) => {
    new MiniNext(uma.app);
};