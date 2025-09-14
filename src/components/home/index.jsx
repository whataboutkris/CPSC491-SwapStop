import React from 'react'
import { useAuth } from '../../context/authContext'

const Home = () => {
    const { currentUser } = useAuth()
    return (
        <div className='text-2xl font-bold pt-14'>
            Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you have successfully logged in.
        </div>
    )
}

export default Home