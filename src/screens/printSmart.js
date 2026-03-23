// import { connectPrinter, printBillBluetooth, printKOTBluetooth } from "./printerService";

import { connectPrinter, printBillBluetooth, printKOTBluetooth } from "../services/printerService";

import { ensureConnected } from "../services/printerManager"



export const printKOTSmart = async (
    tableNo,
    items,
    shopData,
    orderType,
    printerSettings
) => {

    const address =
        printerSettings?.kotPrinter?.address ||
        printerSettings?.billingPrinter?.address;

    if (!address) {
        console.log("No printer configured");
        return;
    }

    const device = await ensureConnected(address);

    if (!device) {
        console.log("Printer connection failed");
        return;
    }

    await printKOTBluetooth(
        device,
        shopData?.shopName || "Restaurant Name",
        orderType,
        tableNo,
        new Date().toLocaleString(),
        items
    );
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
    feedbackUrl
) => {

    const address = printerSettings?.billingPrinter?.address;

    if (!address) {
        console.log("No billing printer configured");
        return;
    }

    const device = await ensureConnected(address);

    if (!device) {
        console.log("Printer connection failed");
        return;
    }

    // ⭐ ADD THIS
    const paperWidth = printerSettings?.paperWidth || "58";

    await printBillBluetooth(
        device,
        shopData,
        orderType,
        new Date(),
        `Table ${tableNo}`,
        cartItems,
        subtotal,
        gst,
        vat,
        total,
        customerName,
        feedbackUrl
    );
};