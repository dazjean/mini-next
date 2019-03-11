import { useState, useEffect } from 'react';
let APP = () => {
    const [time, setTime] = useState(new Date().getTime());
    useEffect(() => {
        let timer = setTimeout(function() {
            setTime(new Date().getTime());
        }, 0);
        console.log('初始渲染!');
        return function() {
            clearTimeout(timer);
            console.log('被卸载了!');
        };
    }, []);
    return (
        <div>
            <div>
                <span>当前时间: {time}</span>
            </div>
        </div>
    );
};
let Parent = () => {
    const [flag, setFlag] = useState(true);
    return (
        <div>
            {flag && <APP />}
            <button
                onClick={() => {
                    setFlag(!flag);
                }}>
                remove
            </button>
        </div>
    );
};
module.exports = Parent;
