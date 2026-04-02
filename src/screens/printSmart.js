// import { connectPrinter, printBillBluetooth, printKOTBluetooth } from "./printerService";

import { connectPrinter, printBillBluetooth, printKOTBluetooth } from "../services/printerService";

import { ensureConnected } from "../services/printerManager"

import RNFS from "react-native-fs";

import { BluetoothManager, BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer";


const paperSize = await AsyncStorage.getItem("paper_size");

const is80mm = paperSize === "80mm";

export const printKOTSmart = async (
    tableNo,
    items,
    shopData,
    orderType,
    printerSettings,
    kotShotRef // 🔥 ADD THIS
) => {
    try {
        const address =
            printerSettings?.kotPrinter?.address ||
            printerSettings?.billingPrinter?.address;

        if (!address) {
            console.log("No printer configured");
            return;
        }

        await BluetoothManager.connect(address);
        console.log("✅ Printer connected");

        await new Promise(resolve => setTimeout(resolve, 100));

        // 🔥 CAPTURE IMAGE
        const uri = await kotShotRef.current.capture({
            format: "png",
            quality: 1,
            result: "tmpfile",
        });

        const base64 = await RNFS.readFile(uri, "base64");

        // 🔥 PRINT IMAGE (REGIONAL SUPPORT)
        await BluetoothEscposPrinter.printPic(base64, {
            width: 576,
            left: is80mm ? 96 : 0,   // (576 - 384) / 2
        });

        console.log("✅ KOT PRINT SUCCESS");

    } catch (err) {
        console.log("KOT PRINT ERROR:", err);
    }
};

export const printBillSmart = async (
    tableNo,
    cartItems,
    subtotal,
    gst,
    vat,
    total,
    shopData,
    orderType,
    printerSettings,
    customerName,
    feedbackUrl,
    viewShotRef
) => {
    try {
        const address = printerSettings?.billingPrinter?.address;

        if (!address) {
            console.log("❌ No printer address");
            return;
        }

        await BluetoothManager.connect(address);
        console.log("✅ Printer connected");

        // 🔥 IMPORTANT FIX (RIGHT PLACE)
        await new Promise(resolve => setTimeout(resolve, 500));

        const uri = await viewShotRef.current.capture({
            format: "png",
            quality: 1,
            result: "tmpfile",
        });

        const base64 = await RNFS.readFile(uri, "base64");

        await BluetoothEscposPrinter.printPic(base64, {
            width: 384, // 🔥 try this even for 58mm
            left: is80mm ? 96 : 0,
        });

        console.log("✅ PRINT SUCCESS");

    } catch (err) {
        console.log("PRINT ERROR:", err);
    }
};