import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNBluetoothClassic from "react-native-bluetooth-classic";

export const PrinterContext = createContext();

export const PrinterProvider = ({ children }) => {

    const [printerSettings, setPrinterSettings] = useState(null);

    const loadPrinters = async () => {
        const data = await AsyncStorage.getItem("printer_settings");

        if (data) {
            setPrinterSettings(JSON.parse(data));
        }
    };

    useEffect(() => {
        loadPrinters();
    }, []);

    const savePrinterSettings = async (settings) => {
        await AsyncStorage.setItem(
            "printer_settings",
            JSON.stringify(settings)
        );

        setPrinterSettings(settings);
    };

    return (
        <PrinterContext.Provider
            value={{
                printerSettings,
                savePrinterSettings
            }}
        >
            {children}
        </PrinterContext.Provider>
    );
};