//test
'use strict';
//引入样式文件
import './with-react.scss';
//引入组件
import React, { Component } from 'react';

class App extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="demo">
                <span>
                    <img src={require('images/with-react/addressIcon.jpg')} />
                </span>
                hello mini-next!
            </div>
        );
    }
}
module.exports = App;
