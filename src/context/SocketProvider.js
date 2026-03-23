import React, { useContext, useEffect } from "react";
import { socket, connectSocket } from "../lib/socket";
import { getShopName } from "../services/shopService";
import { AuthContext } from "./AuthContext";

export default function SocketProvider({ children }) {

    const { user } = useContext(AuthContext);

    useEffect(() => {

        if (!user) return;

        const join = async () => {
            try {
                const res = await getShopName();
                const shopId = res.data?.data?.shopId;

                if (!shopId) return;

                connectSocket(shopId);
            } catch (err) {
                console.log("Socket error:", err);
            }
        };

        join();

        return () => {
            socket.disconnect();
        };
    }, []);

    return children;
}