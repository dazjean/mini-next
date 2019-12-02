'use strict';
//引入样式文件
//引入组件
import './with-react-browserRouter.scss';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ReactDom from 'react-dom';
import App from './app';

let inBrowser = typeof window !== 'undefined';
console.log('当前环234境1是：' + process.env.NODE_ENV);
let ReactRender = ReactDom.hydrate;
inBrowser &&
    ReactRender(
        <Router basename="/with-react-browserRouter">
            <App />
        </Router>,
        document.getElementById('app')
    );
module.exports = App;
