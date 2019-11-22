import React, { useReducer } from 'react';
import TimeReducer from './../reducer/timeReducer';
import { getTime, resetTime, addTime, fetchTime } from './../action/timeAction';
function Clock() {
    const [reduxState, dispatch] = useReducer(TimeReducer, { time: 100000 });
    let initState = async () => {
        let response = await fetch('http://localhost:9991/mock/count.json');
        let listData = await response.json();
        dispatch(getTime(listData.count));
    };
    return (
        <div>
            Seconds: {reduxState.time}
            <button
                onClick={async () => {
                    //initState();//异步获取请求
                    fetchTime().then(action => {
                        dispatch(action);
                    });
                }}>
                get
            </button>
            <button
                onClick={() => {
                    dispatch(resetTime(0));
                }}>
                resetTime
            </button>
            <button
                onClick={() => {
                    dispatch(addTime());
                }}>
                add
            </button>
        </div>
    );
}
module.exports = Clock;
