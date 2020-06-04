'use strict';
import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
let App = $injectApp$;

var inBrowser = typeof window !== 'undefined';
if (inBrowser) {
    window.____miniNext_DATA__ = window.____miniNext_DATA__ || {};
}
inBrowser &&
    ReactDom.hydrate(
        <Router basename="/____miniNext_DATA__pathname">
            <App
                {...window.____miniNext_DATA__.serverProps}
                pathname={window.____miniNext_DATA__.pathname || ''}
                query={window.____miniNext_DATA__.query || ''}
            />
        </Router>,
        document.getElementById('app')
    );
module.exports = hot(App);
