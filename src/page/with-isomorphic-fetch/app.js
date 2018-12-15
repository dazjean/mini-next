//test
'use strict';
//引入样式文件
//引入组件
import React, { Component } from 'react';
require('es6-promise').polyfill();
require('isomorphic-fetch');
class App extends Component {
    constructor(props) {
        super(props);
        this.state = { data: '' };
    }
    async getInitData() {
        let response = await fetch('http://localhost:9991/mock/test.json');
        let listData = await response.json();
        return listData;
    }
    async componentWillMount() {
        let self = this;
        var getData = await this.getInitData();
        console.log(getData);
        self.setState({ data: getData.text });
    }
    render() {
        return <div className="demo">{this.state.data}</div>;
    }
}
module.exports = App;
