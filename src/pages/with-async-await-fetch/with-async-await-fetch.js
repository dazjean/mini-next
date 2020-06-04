//test
'use strict';
//引入样式文件
import './with-async-await-fetch.scss';
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
        self.setState({ data: getData.text }); //服务端渲染时无效 Warning: setState(...): Can only update a mounting component. This usually means you called setState() outside componentWillMount() on the server. This is a no-op
    }
    render() {
        console.log(this.state.data + '-----------');
        return <div className="demo">{this.state.data}</div>;
    }
}
module.exports = App;
