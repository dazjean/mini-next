'use strict';
import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
let App = $injectApp$;

var inBrowser = typeof window !== 'undefined';
if (inBrowser) {
    window.__miniNext_DATA__ = window.__miniNext_DATA__ || {};
}
inBrowser &&
    ReactDom.hydrate(
        <Router basename="/__miniNext_DATA__pathname">
            <App
                {...window.__miniNext_DATA__.serverProps}
                pathName={window.__miniNext_DATA__.pathName || ''}
                pageName={window.__miniNext_DATA__.pageName || ''}
                query={window.__miniNext_DATA__.query || ''}
            />
        </Router>,
        document.getElementById('app')
    );
module.exports = hot(App);
