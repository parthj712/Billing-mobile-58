import React, { createContext, useState, useEffect } from "react";
import {
    getToken,
    saveToken,
    removeToken,
    saveUser,
    getUser,
    removeUser,
} from "../utils/storage";
import { loginCaptain } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkLogin();
    }, []);

    const checkLogin = async () => {
        const token = await getToken();
        const storedUser = await getUser();

        if (token && storedUser) {
            setUser(storedUser);
        }

        setLoading(false);
    };

    const login = async (email, phone, password) => {
        const data = await loginCaptain(email, phone, password);

        await saveToken(data.token);
        await saveUser(data.user);

        setUser(data.user);
    };

    const logout = async () => {
        await removeToken();
        await removeUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, login, logout, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
};