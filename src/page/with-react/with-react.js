//test
'use strict';
//引入样式文件
//引入组件
import './with-react.scss';
import React from 'react';
import ReactDom from 'react-dom';
import App from './app';

var inBrowser = typeof window !== 'undefined';
inBrowser && ReactDom.render(<App />, document.getElementById('app'));

module.exports = App;
