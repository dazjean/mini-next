//test
'use strict';
//引入样式文件
//引入组件
import './with-react-router.scss';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ReactDom from 'react-dom';
import App from './app';

var inBrowser = typeof window !== 'undefined';
inBrowser &&
    ReactDom.render(
        <Router basename="/hmbird_router/with-react-router">
            <App />
        </Router>,
        document.getElementById('app')
    );

module.exports = App;
