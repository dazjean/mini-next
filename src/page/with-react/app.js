//test
'use strict';
//引入样式文件
//引入组件
import React, { Component } from 'react';

class App extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div className="demo">hello HMbird-ssr,I`m a static page</div>;
    }
}
module.exports = App;
