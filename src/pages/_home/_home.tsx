import React from 'react';
type typeProps = {
    query:any,
    pathName:string
}
export default function (props:typeProps){
    return (
        <div className ='ts-demo' >
             <ul>
                <li><a href="/with-react/with-react.html">with-react</a></li>
                <li><a href="/with-react-browserRouter/with-react-browserRouter.html">with-react-browserRouter</a></li>
                <li><a href="/with-react-hashRouter/with-react-hashRouter.html">with-react-hashRouter</a></li>
                <li><a href="/with-isomorphic-fetch/with-isomorphic-fetch.html">with-isomorphic-fetch</a></li>
                <li><a href="/with-async-await-fetch/with-async-await-fetch.html">with-async-await-fetch</a></li>
                <li><a href="/with-react-hooks/with-react-hooks.html">with-react-hooks</a></li>
                <li><a href="/with-typescript/with-typescript.html">with-typescript</a></li>
            </ul>
        </div>
    )
}