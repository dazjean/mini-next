import React from 'react';
type typeProps = {
    query:any,
    pathName:string
}
export default function (props:typeProps){
    console.log(props);
    return (
        <div className ='ts-demo' >hi mini-next with typescript!!1</div>
    )
}