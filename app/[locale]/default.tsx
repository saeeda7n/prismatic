import React from 'react';

const Default =async ({searchParams}:{searchParams:any}) => {
    console.log(await searchParams)
    return (
        <div>
            Default Root
        </div>
    );
};

export default Default;