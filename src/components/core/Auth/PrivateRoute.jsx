import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({children}) => {

    const {token, initialized} = useSelector((state) => state.auth);

    if (!initialized)
        return null
    if(token !== null)
        return children
    else
        return <Navigate to="/login" />

}

export default PrivateRoute
