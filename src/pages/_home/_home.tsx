import React from 'react';
type typeProps = {
    query:any,
    pathName:string
}
export default function (props:typeProps){
    return (
        <div className ='ts-demo' >
             <ul>
                <li><a href="/with-react">with-react</a></li>
                <li><a href="/with-react-browserRouter">with-react-browserRouter</a></li>
                <li><a href="/with-react-hashRouter">with-react-hashRouter</a></li>
                <li><a href="/with-isomorphic-fetch">with-isomorphic-fetch</a></li>
                <li><a href="/with-async-await-fetch">with-async-await-fetch</a></li>
                <li><a href="/with-react-hooks">with-react-hooks</a></li>
                <li><a href="/with-typescript">with-typescript</a></li>
            </ul>
        </div>
    )
}