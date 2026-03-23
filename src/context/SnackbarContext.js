import React, { createContext, useState } from "react";
import { Snackbar } from "react-native-paper";
import { Text } from "react-native-paper";

export const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [type, setType] = useState("info");

    const showSnackbar = (msg, variant = "info") => {
        setMessage(msg);
        setType(variant);
        setVisible(true);
    };

    const getBackgroundColor = () => {
        switch (type) {
            case "success":
                return "#16a34a";
            case "error":
                return "#dc2626";
            case "warning":
                return "#f59e0b";
            default:
                return "#1e293b";
        }
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}

            <Snackbar
                visible={visible}
                onDismiss={() => setVisible(false)}
                duration={2500}
                style={{
                    backgroundColor: getBackgroundColor(),
                    borderRadius: 12,
                    marginBottom: 20,
                }}
            >
                <Text style={{ color: "#fff" }}>
                    {message}
                </Text>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};