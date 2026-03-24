import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Image } from "react-native";

export const BillDesign = ({
    shopData,
    items,
    subtotal,
    gst,
    vat,
    total,
    customerName,
    orderType,
    feedbackUrl,
}) => {

    console.log("feedbackUrl:", feedbackUrl);
    console.log("subtotal:", subtotal);
    console.log("gst:", gst);
    console.log("vat:", vat);



    const formatItemName = (item) => {
        let name = item.name;

        if (item.variantName) {
            name += ` (${item.variantName})`;
        }

        if (item.portion) {
            name += ` (${item.portion})`;
        }

        return name;
    };

    const formatTime = () => {
        const d = new Date();
        return d.toLocaleString("en-IN");
    };

    return (
        <View style={styles.container}>

            {shopData?.logo?.url && (
                <View style={{ alignItems: "center", marginBottom: 8 }}>
                    <Image
                        source={{ uri: shopData.logo.url }}
                        style={{
                            width: 300,   // 🔥 adjust size
                            height: 160,
                            resizeMode: "center",
                        }}
                    />
                </View>
            )}

            {/* 🔥 HEADER */}
            <Text style={styles.shopName}>
                {shopData?.shopName || "Restaurant"}
            </Text>

            {shopData?.tagline && (
                <Text style={styles.smallText}>
                    {shopData.tagline}
                </Text>
            )}

            {shopData?.address && (
                <Text style={styles.smallText}>
                    Address:{shopData.address}
                </Text>
            )}

            {shopData?.phone && (
                <Text style={styles.smallText}>
                    Phone:{shopData.phone}
                </Text>
            )}

            {shopData?.gstNumber && (
                <Text style={styles.smallText}>
                    GST:{shopData.gstNumber}
                </Text>
            )}



            {shopData?.website && (
                <Text style={styles.smallText}>
                    Website:{shopData.website}
                </Text>
            )}

            <Text style={styles.divider}>
                ----------------------------------------------------------------------------------
            </Text>

            {/* 🔥 ORDER INFO */}
            <Text style={styles.leftText}>OrderType :{orderType}</Text>

            {customerName && (
                <Text style={styles.leftText}>
                    Customer Name: {customerName}
                </Text>
            )}

            <Text style={styles.leftText}>
                Date & Time: {formatTime()}
            </Text>


            <Text style={styles.divider}>
                ----------------------------------------------------------------------------------
            </Text>



            {/* 🔥 ITEMS */}
            {items.map((item, index) => {
                const totalPrice = item.qty * item.price;

                return (
                    <View key={index} >

                        <Text style={styles.itemName}>
                            {formatItemName(item)}
                        </Text>

                        <View style={styles.row}>
                            <Text style={styles.itemQty}>
                                Qty: {item.qty}
                            </Text>

                            <Text style={styles.itemPrice}>
                                ₹ {totalPrice.toFixed(2)}
                            </Text>
                        </View>

                    </View>
                );
            })}


            <Text style={styles.divider}>
                ----------------------------------------------------------------------------------
            </Text>

            <View style={styles.row}>
                <Text style={styles.totalText}>Subtotal</Text>
                <Text style={styles.totalText}>₹ {Number(subtotal || 0).toFixed(2)}</Text>
            </View>

            {gst > 0 && (
                <View style={styles.row}>
                    <Text style={styles.totalText}>GST</Text>
                    <Text style={styles.totalText}>₹ {gst.toFixed(2)}</Text>
                </View>
            )}

            {vat > 0 && (
                <View style={styles.row}>
                    <Text style={styles.totalText}>VAT</Text>
                    <Text style={styles.totalText}>₹ {vat.toFixed(2)}</Text>
                </View>
            )}


            <Text style={styles.divider}>
                ----------------------------------------------------------------------------------
            </Text>

            <View style={styles.row}>
                <Text style={styles.totalText}>TOTAL</Text>
                <Text style={styles.totalText}>
                    ₹ {total.toFixed(2)}
                </Text>
            </View>


            {/* 🔥 TOTALS */}



            <Text style={styles.divider}>
                ----------------------------------------------------------------------------------
            </Text>

            {/* 🔥 QR TEXT (optional) */}
            {feedbackUrl && (
                <View style={{ alignItems: "center", marginTop: 16 }}>
                    <QRCode
                        value={feedbackUrl}
                        size={160}
                    />
                    <Text style={styles.centerText}>
                        Scan & Review Us
                    </Text>
                </View>
            )}

            {/* 🔥 FOOTER */}
            <Text style={styles.centerText}>
                धन्यवाद 🙏
            </Text>

            <Text style={styles.centerText}>
                Thank You - Visit Again
            </Text>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 384,
        backgroundColor: "#fff",
    },

    shopName: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        color: "black",
    },

    smallText: {
        fontSize: 22,
        textAlign: "center",
        color: "black",
    },

    divider: {
        textAlign: "center",
        marginVertical: 5,
        color: "black",
    },


    centerText: {
        fontSize: 20,
        textAlign: "center",
        marginTop: 5,
        color: "black",
    },

    itemName: {
        fontSize: 20,
        fontWeight: "500",
        color: "black",
    },

    itemQty: {
        fontSize: 20,
        color: "black",
    },

    itemPrice: {
        fontSize: 20,
        color: "black",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",

    },

    totalText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "black",
    },
});