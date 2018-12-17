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
        this.getInitData = this.getInitData.bind(this);
    }
    getInitData() {
        let self = this;
        fetch('http://localhost:9991/mock/test.json')
            .then(response => {
                return response.json();
            })
            .then(res => {
                self.setState({ data: res.text });
            })
            .catch(e => {
                self.setState({ data: '接口异常' + e });
            });
    }
    componentWillMount() {
        let self = this;
        self.getInitData();
    }
    render() {
        return <div className="demo">{this.state.data}</div>;
    }
}
module.exports = App;
