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
        console.log(props);
        this.state = { userAgent: props.userAgent };
        //this.getInitData = this.getInitData.bind(this);
    }
    static async getInitialProps({ req }) {
        const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
        const res = await fetch('http://localhost:8001/test.json');
        const json = await res.json();
        return { text: json.text, userAgent: userAgent };
    }
    render() {
        return (
            <div className="demo">
                s1tate:{this.state.userAgent}
                propts:{JSON.stringify(this.props)}
            </div>
        );
    }
    async componentDidMount() {
        const res = await fetch('http://localhost:8001/test.json');
        const json = await res.json();
        this.setState({ userAgent: json.text });
    }
}
module.exports = App;
