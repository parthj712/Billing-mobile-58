import React, { useState, useContext, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from "react-native";
import { scanPrinters } from "../services/printerService";
import { PrinterContext } from "../context/PrinterContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { PermissionsAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SnackbarContext } from "../context/SnackbarContext";


export default function PrinterSetupScreen({ closeModal }) {


    const { showSnackbar } = useContext(SnackbarContext);


    console.log("i am in printert setup screen")

    const { savePrinterSettings } = useContext(PrinterContext);
    const [devices, setDevices] = useState([]);
    const [selectedPrinter, setSelectedPrinter] = useState(null);

    const [billingPrinter, setBillingPrinter] = useState(null);
    const [kotPrinter, setKotPrinter] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadSavedPrinters = async () => {
            try {
                const data = await AsyncStorage.getItem("printer_settings");

                if (!data) return;



                const settings = JSON.parse(data);

                console.log("data", settings)

                if (settings.billingPrinter) {
                    setBillingPrinter(settings.billingPrinter);
                }

                if (settings.kotPrinter) {
                    setKotPrinter(settings.kotPrinter);
                }

            } catch (err) {
                console.log("Load printer error:", err);
            }
        };

        loadSavedPrinters();
    }, []);

    const handleScan = async () => {
        try {

            // 1️⃣ Ask permission first
            const allowed = await requestBluetoothPermission();

            if (!allowed) {
                showSnackbar("Bluetooth permission required", "error");
                return;
            }

            // 2️⃣ Then scan
            const list = await scanPrinters();

            console.log("Found printers:", list);

            if (!list || list.length === 0) {
                showSnackbar("No printers found", "warning");
                return;
            }

            setDevices(list);

        } catch (err) {
            console.log("Scan error:", err);
            showSnackbar("Scan failed", "error");
        }
    };

    // const selectPrinter = async (device) => {


    //     setSelectedPrinter(device.address);

    //     const settings = {
    //         mode: "SINGLE",
    //         billingPrinter: {
    //             name: device.name,
    //             address: device.address,
    //         },
    //     };

    //     await savePrinterSettings(settings);
    //     alert("Printer Saved Successfully");
    // };

    const selectBillingPrinter = (device) => {
        setBillingPrinter({
            name: device.name,
            address: device.address
        });
    };

    const selectKOTPrinter = (device) => {
        setKotPrinter({
            name: device.name,
            address: device.address
        });
    };

    const requestBluetoothPermission = async () => {
        try {

            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            ]);

            if (
                granted["android.permission.BLUETOOTH_CONNECT"] === "granted" &&
                granted["android.permission.BLUETOOTH_SCAN"] === "granted"
            ) {
                return true;
            }

            return false;

        } catch (err) {
            console.log("Permission error:", err);
            return false;
        }
    };

    const renderPrinter = ({ item }) => {

        const isBilling = billingPrinter?.address === item.address;
        const isKOT = kotPrinter?.address === item.address;

        // const isSelected =
        //     billingPrinter?.address === item.address ||
        //     kotPrinter?.address === item.address;

        return (
            <View style={styles.printerCard}>

                <View style={styles.printerInfo}>
                    <Text style={styles.printerIcon}>🖨️</Text>

                    <View>
                        <Text style={styles.printerName}>
                            {item.name || "Unknown Printer"}
                        </Text>
                        <Text style={styles.printerAddress}>
                            {item.address}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: "row", gap: 16 }}>

                    <TouchableOpacity
                        onPress={() => selectBillingPrinter(item)}
                    >
                        <Text style={{
                            color: isBilling ? "#4F46E5" : "#888",
                            fontWeight: isBilling ? "700" : "400"
                        }}>
                            {isBilling ? "Billing ✓" : "Billing"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => selectKOTPrinter(item)}
                    >
                        <Text style={{
                            color: isKOT ? "#10B981" : "#888",
                            fontWeight: isKOT ? "700" : "400"
                        }}>
                            {isKOT ? "KOT ✓" : "KOT"}
                        </Text>
                    </TouchableOpacity>

                </View>

            </View>
        );
    };

    const savePrinters = async () => {
        if (saving) return; // prevent multiple clicks

        if (!billingPrinter) {
            showSnackbar("Select Billing Printer", "warning");
            return;
        }

        try {
            setSaving(true);

            const settings = {
                mode: kotPrinter ? "DUAL" : "SINGLE",
                billingPrinter,
                kotPrinter
            };

            await savePrinterSettings(settings);

            showSnackbar("Printers Saved Successfully", "success");

            // 🔥 CLOSE MODAL MANUALLY (controlled)
            setTimeout(() => {
                closeModal();
            }, 800); // smooth UX

        } catch (err) {
            console.log(err);
            showSnackbar("Failed to save printers", "error");
        } finally {
            setSaving(false);
        }
    };



    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Bluetooth Printer Setup</Text>

            <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
                <Text style={styles.scanText}>Scan Printers</Text>
            </TouchableOpacity>

            <FlatList
                data={devices}
                keyExtractor={(item, index) => item.address || index.toString()}
                renderItem={renderPrinter}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 20 }}
            />

            <TouchableOpacity style={styles.scanButton} onPress={savePrinters}>
                <Text style={styles.scanText}>Save Printers</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        // backgroundColor: "#F6F7FB",
    },

    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 20,
        color: "black"
    },

    scanButton: {
        backgroundColor: "#4F46E5",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
    },

    scanText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },

    printerCard: {
        backgroundColor: "white",
        padding: 14,
        borderRadius: 14,
        marginBottom: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },

    selectedCard: {
        borderWidth: 2,
        borderColor: "#4F46E5",
    },

    printerInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    printerIcon: {
        fontSize: 24,
    },

    printerName: {
        fontSize: 16,
        fontWeight: "600",
        color: "black"
    },

    printerAddress: {
        fontSize: 13,
        color: "#777",
    },

    selectedText: {
        color: "#4F46E5",
        fontWeight: "600",
    },
});