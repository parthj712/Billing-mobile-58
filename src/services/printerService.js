import RNBluetoothClassic from "react-native-bluetooth-classic";
import {
    getLineWidth,
    line,
    formatRow,
    wrapText,
    alignCenter,
    alignLeft,
    boldOn,
    boldOff,
    doubleText,
    normalText,
    qrCommand
} from "./printerFormatter";
import Sanscript from "sanscript";


const toSentenceCase = (text) => {
    if (!text) return "";
    text = text.toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
};

const fixMarathiWords = (text) => {
    return text
        .replace(/mti/g, "nti")   // विश्रांती fix
        .replace(/sthana/g, "sthan")
        .replace(/aa/g, "a");     // optional smoothing
};

const safePrint = (text) => {
    try {
        let converted = Sanscript.t(text, "devanagari", "itrans");

        converted = fixMarathiWords(converted);

        return toSentenceCase(converted);
    } catch (e) {
        return text;
    }
};


const formatBillItem = (name, qty, price, width = 32) => {
    const safeName = safePrint(name);
    const total = (qty * price).toFixed(2);

    const rightText = `Rs ${total}`;
    const leftText = `${safeName} x${qty}`;

    const maxLeftWidth = width - rightText.length - 1;

    let lines = [];
    let current = "";

    const words = leftText.split(" ");

    words.forEach(word => {
        if ((current + word).length <= maxLeftWidth) {
            current += word + " ";
        } else {
            lines.push(current.trim());
            current = word + " ";
        }
    });

    if (current) lines.push(current.trim());

    let result = "";

    lines.forEach((line, index) => {
        if (index === 0) {
            const spaces = width - line.length - rightText.length;
            result += line + " ".repeat(spaces > 0 ? spaces : 1) + rightText + "\n";
        } else {
            result += line + "\n";
        }
    });

    return result;
};

/* Scan Bluetooth printers */
export const scanPrinters = async () => {
    try {

        const enabled = await RNBluetoothClassic.isBluetoothEnabled();

        if (!enabled) {
            console.log("Bluetooth is OFF");
            return [];
        }

        const devices = await RNBluetoothClassic.getBondedDevices();

        return devices || [];

    } catch (error) {
        console.log("Bluetooth scan error:", error);
        return [];
    }
};

/* Connect printer */
export const connectPrinter = async (address) => {
    try {
        const device = await RNBluetoothClassic.connectToDevice(address);
        return device;
    } catch (err) {
        console.log("Connect error:", err);
        return null;
    }
};

/* 58mm formatting */
// const line = () => "--------------------------------\n";

const formatItem = (name, qty, price) => {
    const total = qty * price;
    let left = `${name} x${qty}`;
    let right = `₹${total}`;

    const spacing = 32 - left.length - right.length;
    return left + " ".repeat(spacing > 0 ? spacing : 1) + right + "\n";
};

/* Print KOT */
export const printKOTBluetooth = async (
    device,
    shopName,
    orderType,
    tableNo,
    date,
    items
) => {

    const width = 32;

    let data = "";

    data += "\x1B\x40"; // reset printer
    data += "\x1B\x74\x00"; // code page

    data += alignCenter();
    data += boldOn();
    data += `${shopName}\n`;
    data += boldOff();

    data += alignCenter();
    data += "KITCHEN ORDER TICKET\n";

    data += alignLeft();

    data += line(width);

    data += `Order Type: ${orderType}\n`;

    if (tableNo) {
        data += `Table No: ${tableNo}\n`;
    }

    data += `Date: ${date}\n`;

    data += line(width);

    items.forEach(item => {

        data += boldOn();
        // data += `${item.name} (${item.portion})\n`;
        let itemName = item.name;

        if (item.variantName) {
            itemName += ` (${item.variantName})`;
        }

        if (item.portion) {
            itemName += ` (${item.portion})`;
        }

        data += `${safePrint(itemName)}\n`;
        data += boldOff();

        data += `Qty: ${item.qty}\n`;

        if (item.note) {
            // data += `Note: ${item.note}\n`;
            data += `Note: ${safePrint(item.note)}\n`;
        }

        data += line(width);

    });

    data += alignCenter();
    data += "--- Kitchen Copy ---\n";

    data += "\n\n\n";

    await device.write(data);
};

/* QR command */
// const qrCommand = (data) => {
//     return (
//         "\x1D\x28\x6B\x04\x00\x31\x41\x32\x00" +
//         "\x1D\x28\x6B" +
//         String.fromCharCode(data.length + 3, 0) +
//         "\x31\x50\x30" +
//         data +
//         "\x1D\x28\x6B\x03\x00\x31\x51\x30"
//     );
// };

/* Print Bill */
export const printBillBluetooth = async (
    device,
    shopInfo,
    orderType,
    date,
    tableLabel,
    items,
    subtotal,
    gst,
    vat,
    total,
    customerName,
    feedbackUrl
) => {
    console.log("shopinfo", shopInfo);
    console.log("----------------------------------");
    console.log("Customer Name:", customerName);
    console.log("Feedback URL for QR:", feedbackUrl);

    const width = 32;

    const formatPrintTime = (date) => {
        const d = new Date(date);
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12;
        hours = hours === 0 ? 12 : hours;

        return `${hours}:${minutes} ${ampm}`;
    };

    let data = "";

    data += "\x1B\x40"; // reset printer
    data += "\x1B\x61\x01"; // center

    // Shop Name
    data += "\x1B\x45\x01"; // bold
    data += `${safePrint(shopInfo?.shopName || "Restaurant")}\n`;
    data += "\x1B\x45\x00";

    // Address
    if (shopInfo?.address) {
        data += `Address: ${safePrint(shopInfo.address)}\n`;
    }

    // Mobile
    if (shopInfo?.phone) {
        data += `Mobile: ${shopInfo.phone}\n`;
    }

    // Tagline
    if (shopInfo?.tagline) {
        data += `${safePrint(shopInfo.tagline)}\n`;
    }

    // Website
    if (shopInfo?.website) {
        data += `Website: ${shopInfo.website}\n`;
    }

    data += line(width);

    data += "\x1B\x61\x00"; // left align

    const d = new Date(date);
    const formattedDate = d.toLocaleDateString("en-IN");
    const formattedTime = formatPrintTime(date);

    data += `${orderType}\n`;

    // if (tableLabel) {
    //     data += `Table: ${tableLabel}\n`;
    // }

    if (customerName) {
        data += `Customer Name: ${customerName}\n`;
    }

    data += `${formattedDate} ${formattedTime}\n`;

    data += line(width);

    items.forEach((item) => {
        let itemName = item.name;

        if (item.variantName) {
            itemName += ` (${item.variantName})`;
        }

        if (item.portion) {
            itemName += ` (${item.portion})`;
        }

        data += formatBillItem(itemName, item.qty, item.price, width);
    });

    data += line(width);
    data += formatRow("Subtotal", `Rs ${subtotal.toFixed(2)}`, width);

    if (gst > 0) {
        data += formatRow("GST (5%)", `Rs ${gst.toFixed(2)}`, width);
    }

    if (vat > 0) {
        data += formatRow("VAT (10%)", `Rs ${vat.toFixed(2)}`, width);
    }

    data += line(width);

    data += boldOn();
    data += formatRow("Total", `Rs ${total.toFixed(2)}`, width);
    data += boldOff();

    if (feedbackUrl) {
        data += alignCenter();
        data += "\nShare Your Feedback\n";

        data += "\x1D\x28\x6B\x04\x00\x31\x41\x32\x00";
        data += "\x1D\x28\x6B\x03\x00\x31\x43\x06";
        data += "\x1D\x28\x6B\x03\x00\x31\x45\x30";

        const qrData = feedbackUrl;

        data +=
            "\x1D\x28\x6B" +
            String.fromCharCode(qrData.length + 3, 0) +
            "\x31\x50\x30" +
            qrData;

        data += "\x1D\x28\x6B\x03\x00\x31\x51\x30";

        data += "\nScan & Review Us *\n";
    }

    data += "\x1B\x61\x01";
    data += "Thank You - Visit Again\n";
    data += "\n\n\n";

    await device.write(data);
};