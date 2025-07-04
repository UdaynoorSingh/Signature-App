import React, {createContext, useState, useEffect, useContext} from 'react';
import axios from '../utils/axios';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() =>{
        const fetchUser = async () =>{
            const token = localStorage.getItem('token');
            if(token){
                try{
                    const res = await axios.get('/api/auth/profile');
                    setUser(res.data.user);
                } 
                catch(error){
                    console.error('Failed to fetch user profile', error);
                    localStorage.removeItem('token'); 
                    setUser(null);
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
}; 