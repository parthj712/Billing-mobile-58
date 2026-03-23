import RNBluetoothClassic from "react-native-bluetooth-classic";

export const ensureConnected = async (address) => {
    try {
        const connectedDevices = await RNBluetoothClassic.getConnectedDevices();

        const alreadyConnected = connectedDevices.find(
            (d) => d.address === address
        );

        if (alreadyConnected) {
            console.log("Printer already connected");
            return alreadyConnected;
        }

        const device = await RNBluetoothClassic.connectToDevice(address);

        console.log("Printer connected:", address);

        return device;

    } catch (err) {
        console.log("Reconnect failed:", err);
        return null;
    }
};