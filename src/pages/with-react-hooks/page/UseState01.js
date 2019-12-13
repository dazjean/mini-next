import React, { useState } from 'react';
let APP = initProps => {
    const [count, setCount] = useState(initProps.count);
    return (
        <div>
            <div>
                <span>Coweunt: {count}</span>
            </div>
            <button onClick={() => setCount(0)}>Reset</button>
            <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
            <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
        </div>
    );
};
module.exports = APP;
