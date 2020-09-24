'use strict';
//引入样式文件
import './with-react-hashRouter.scss';
//引入组件
import React, { Component } from 'react';
import { Route, Link, Switch } from 'react-router-dom';
class Home extends Component {
    constructor(props) {
        super(props);
        this.goAboutPage = this.goAboutPage.bind(this);
    }
    goAboutPage() {
        // this.props.history.push({
        //     pathname: '/about',
        //     custom: {
        //         msg: '来自首页的问候！by custom'
        //     }
        // });
        // this.props.history.push({
        //     pathname: '/about',
        //     query: {
        //         msg: '来自首页的问候！by query'
        //     }
        // });
        this.props.history.push({
            pathname: '/about',
            state: {
                msg: '来自首页的问候！by state'
            }
        });
        //this.props.history.push({ pathname: "/about/'我是url参数'" });
        //this.props.history.push({ pathname:"/about?msg='我是url参数'"});
    }
    render() {
        return (
            <div>
                我是首页路由
                <br />
                <Link to="/about?msg='我是url参数'">去关于我的页面 url传递参数</Link>
                <br />
                <Link to="/about/我是url参数">去关于我的页面 路由配置传递参数</Link>
                <div onClick={this.goAboutPage}>去关于我的页面 js方式state传递参数</div>
            </div>
        );
    }
}

class About extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        console.log(this.props.location);
        return (
            <div className="demo">
                我是一个路由跳转后的子页面
                <br />
                <div>参数：{JSON.stringify(this.props.location)}</div>
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
                <img src={require('images/with-react/timeico.png')} />
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/about" component={About} />
                    <Route exact path="/about/:msg" component={About} />
                    <Route component={Home} />
                </Switch>
            </div>
        );
    }
}
module.exports = APP;
