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
import API from "../services/api";

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

    const login = async (userName, password) => {

        console.log("userName", userName)

        const data = await loginCaptain(userName, password);

        console.log("data", data)

        await saveToken(data.token);
        await saveUser(data.user);

        setUser(data.user);
    };

    const logout = async () => {
        try {
            // ✅ Call backend logout API (same as web)
            await API.post("/staff/staff-logout");
            console.log("Logout API success");
        } catch (error) {
            console.log("Logout API error:", error);
        }

        // ✅ Always clear local data (even if API fails)
        await removeToken();
        await removeUser();

        // ✅ Reset user state
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