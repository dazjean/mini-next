//test
'use strict';
//引入样式文件
//引入组件
import React, { Component } from 'react';
import { Route, Link, Switch } from 'react-router-dom';
class Home extends Component {
    constructor(props) {
        super(props);
        this.goAboutPage = this.goAboutPage.bind(this);
    }
    goAboutPage() {
        this.props.history.push({
            pathname: '/about',
            state: {
                msg: '来自首页的问候！'
            }
        });
        //history.push('/about', { state: { msg: 'laizhi' } });
    }
    render() {
        return (
            <div>
                我是首页路由
                <br />
                <Link to="/about">关于我</Link>
                <div onClick={this.goAboutPage}>去关于我的页面 带参数state</div>
            </div>
        );
    }
}

class About extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="demo">
                我是一个路由跳转后的子页面
                <br />
                <div>参数：{this.props.location.state.msg}</div>
                <Link to="/">回首页</Link>
            </div>
        );
    }
}

class APP extends Component {
    render() {
        return (
            <div>
                <h1>with-react-router4</h1>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/about" component={About} />
                    <Route component={Home} />
                </Switch>
            </div>
        );
    }
}
module.exports = APP;
