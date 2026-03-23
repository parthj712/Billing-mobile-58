import React, { useMemo, useState, useEffect, useContext } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
    fetchActiveOrder,
    fetchActiveTakaway,
    itemIncrement,
    itemDecrement,
    finalizeBillAndOrder,
    printKot,
} from "../../services/orderService";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { socket } from "../../lib/socket";
import { SnackbarContext } from "../../context/SnackbarContext";

import { PrinterContext } from "../../context/PrinterContext";
import { printBillSmart, printKOTSmart } from "../../screens/printSmart";
import { getFeedbackLink, getShopInfo } from "../../services/shopService";



export default function OrderCart({
    tableId,
    orderType,
    tableNo,
    onBack,
    refreshTrigger,   // ✅ ADD THIS
    onCartUpdate
}) {
    const isDineIn = orderType === "DINE-IN";

    const { showSnackbar } = useContext(SnackbarContext);

    const { printerSettings } = useContext(PrinterContext);


    // ✅ Add here
    const billingPrinter = printerSettings?.billingPrinter;
    const kotPrinter = printerSettings?.kotPrinter || billingPrinter;

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [shopData, setShopData] = useState(null);
    const [customerName, setCustomerName] = useState("");


    const [feedbackUrl, setFeedbackUrl] = useState(null);


    const fetchFeedbackLink = async () => {
        try {
            const res = await getFeedbackLink();

            console.log("Feedback API Response:", res.data.feedbackUrl);

            if (res?.data?.success) {
                setFeedbackUrl(res.data.feedbackUrl);
            }

        } catch (error) {
            console.log("Feedback API Error:", error?.response?.data || error);
        }
    };

    useEffect(() => {
        fetchFeedbackLink();
    }, []);

    // 🔥 Load Order (Same as Web loadOrder)
    const loadOrder = async () => {
        try {
            if (orderType === "DINE-IN" && !tableId) return;

            setLoading(true);

            let res;

            if (orderType === "TAKEAWAY") {

                res = await fetchActiveTakaway();

                console.log("fetchActiveTakaway".res?.data)

            } else if (orderType === "DINE-IN" && tableId) {
                res = await fetchActiveOrder(tableId);
            }

            // console.log("ORDER API RESPONSE:", res?.data);   // ⭐ ADD THIS

            setCartItems(res?.data?.items || []);
            setCustomerName(res?.data?.customer?.name || "");

        } catch (err) {
            console.log("Load order error:", err);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    console.log(cartItems, "cartitems")

    const fetchShopData = async () => {
        try {
            const res = await getShopInfo();
            setShopData(res?.data?.data);
            console.log("Shop data:", res?.data?.data); // Debugging line
        } catch (error) {
            console.log("Shop fetch error", error);
            setShopData({}); // fallback
        }
    };

    useEffect(() => {
        fetchShopData();
    }, []);

    useEffect(() => {
        if (onCartUpdate) {
            const totalItems = cartItems.reduce(
                (sum, item) => sum + Number(item.qty),
                0
            );

            onCartUpdate(totalItems, total);
        }
    }, [cartItems, total]);

    useEffect(() => {
        if (orderType === "TAKEAWAY") {
            loadOrder();
        }
        else if (orderType === "DINE-IN" && tableId) {
            loadOrder();
        }
    }, [tableId, orderType]);

    useEffect(() => {
        if (refreshTrigger !== undefined) {
            loadOrder();
        }
    }, [refreshTrigger]);


    useEffect(() => {
        const handleOrderUpdate = (data) => {
            // Important: only update if same table
            if (
                (orderType === "TAKEAWAY" && data.orderType === "TAKEAWAY") ||
                (data.tableId === tableId)
            ) {
                setCartItems(data.items || []);
            }
        };

        socket.on("orderUpdated", handleOrderUpdate);

        return () => {
            socket.off("orderUpdated", handleOrderUpdate);
        };
    }, [tableId, orderType]);


    // useFocusEffect(
    //     useCallback(() => {
    //         loadOrder();
    //     }, [tableId, orderType])
    // );

    // 🔹 Increase Qty (API Connected)
    const increaseQty = async (item) => {
        try {
            await itemIncrement({
                tableId,
                menuItemId: item.menuItemId,
                portion: item.portion || null,
                variantName: item.variantName || null,
            });
        } catch (err) {
            showSnackbar("Failed to increase item", "error");
        }
    };

    // 🔹 Decrease Qty (API Connected)
    const decreaseQty = async (item) => {
        try {
            await itemDecrement({
                tableId,
                menuItemId: item.menuItemId,
                portion: item.portion || null,
                variantName: item.variantName || null,
            });

            loadOrder();
        } catch (err) {
            showSnackbar("Failed to decrease item", "error");
        }
    };

    const printedItems = cartItems.filter((i) => i.kotPrinted);
    const newItems = cartItems.filter((i) => !i.kotPrinted);

    const GST_PERCENT = 5;
    const VAT_PERCENT = 10;

    const { foodSubtotal, liquorSubtotal } = useMemo(() => {
        let food = 0;
        let liquor = 0;

        cartItems.forEach((item) => {
            const itemTotal = (Number(item.price) || 0) * (Number(item.qty) || 0);
            const category = item.category?.trim().toLowerCase();

            if (category === "liquor" || category === "liqour") {
                liquor += itemTotal;
            } else {
                food += itemTotal;
            }
        });

        return {
            foodSubtotal: food,
            liquorSubtotal: liquor,
        };
    }, [cartItems]);

    const subtotal = foodSubtotal + liquorSubtotal;

    const hasGST = !!shopData?.gstNumber;
    const hasVAT = !!shopData?.vatNumber;

    const gst = hasGST ? foodSubtotal * (GST_PERCENT / 100) : 0;
    const vat = hasVAT ? liquorSubtotal * (VAT_PERCENT / 100) : 0;

    const total = subtotal + gst + vat;

    // 🔥 Print KOT
    const handlePrintKOT = async () => {
        try {
            // ✅ Add this here
            if (newItems.length === 0) {
                showSnackbar("No new items to print", "error");
                return;
            }

            if (!kotPrinter) {
                console.log("KOT TEST MODE");
                console.log("Table:", tableNo);
                console.log("Items:", newItems);

                showSnackbar("KOT Test Mode (Printer Disabled)", "success");
            } else {
                await printKOTSmart(
                    tableNo,
                    newItems,
                    shopData,
                    orderType,
                    printerSettings
                );
            }

            await printKot(tableId);

            showSnackbar("KOT Printed", "success");

            loadOrder();
            // navigation.navigate("Tables")
        } catch (err) {
            console.log("KOT ERROR:", err?.response?.data || err.message);
            Alert.alert(
                "KOT Failed",
                err?.response?.data?.message || "Something went wrong"
            );
            showSnackbar("KOT Failed: " + (err?.response?.data?.message || "Something went wrong"), "error");

        }
    };

    // 🔥 Finalize Billing
    const handleConfirmBilling = async () => {
        try {
            setLoading(true);

            await finalizeBillAndOrder({ tableId, orderType });


            // await printBillBluetooth(
            //     tableNo,
            //     cartItems,
            //     subtotal,
            //     tax,
            //     total
            // );

            if (!billingPrinter) {

                console.log("BILL TEST MODE");
                console.log({
                    tableNo,
                    cartItems,
                    foodSubtotal,
                    liquorSubtotal,
                    subtotal,
                    gst,
                    vat,
                    total
                });;

                showSnackbar("Bill Generated (Printer Disabled)", "success");

            } else {

                await printBillSmart(
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
                );
            }

            // Alert.alert("Success", "Billing Completed");
            showSnackbar("Billing Completed", "success");

            setConfirmVisible(false);
            loadOrder();
        } catch (err) {
            console.log("BILL ERROR:", err?.response?.data || err.message);
            showSnackbar(
                "Billing Failed: " +
                (err?.response?.data?.message || err.message),
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const renderItem = (item, highlight = false) => (
        <View key={item._id} style={styles.itemRow}>
            <View>
                <Text style={styles.itemName}>
                    {item.name}
                    {item.variantName && ` (${item.variantName})`}
                    {item.portion && ` (${item.portion})`}
                </Text>
                <Text style={styles.itemPrice}>₹ {item.price}</Text>

                {highlight && (
                    <Text style={styles.newTag}>NEW ITEM</Text>
                )}
            </View>

            <View style={styles.qtyBox}>
                <TouchableOpacity onPress={() => decreaseQty(item)}>
                    <MaterialIcons name="remove" size={20} color ="black"/>
                </TouchableOpacity>

                <Text style={styles.qtyText}>{item.qty}</Text>

                <TouchableOpacity onPress={() => increaseQty(item)}>
                    <MaterialIcons name="add" size={20} color ="black"/>
                </TouchableOpacity>
            </View>
        </View>
    );


    console.log("OrderType:", orderType);
    console.log("TableId:", tableId);


    if (!printerSettings?.kotPrinter && !printerSettings?.billingPrinter) {
        console.log("Printer disabled");
    }


    // console.log("Printer Settings:", printerSettings);

    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                {isDineIn ? `Table ${tableNo}` : "Takeaway"} - Cart
            </Text>

            {loading && <ActivityIndicator size="large" />}


            <ScrollView
                contentContainerStyle={{ paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                {cartItems.length === 0 && !loading && (
                    <Text style={styles.emptyText}>
                        No items added
                    </Text>
                )}

                {printedItems.map((item) => renderItem(item, false))}

                {newItems.length > 0 && (
                    <>
                        <View style={styles.divider} />
                        <Text style={styles.newItemsTitle}>
                            New Items
                        </Text>
                    </>
                )}

                {newItems.map((item) => renderItem(item, true))}

                <View style={styles.totalBox}>
                    <View style={styles.rowBetween}>
                        <Text style={{color : "black"}}>Subtotal</Text>
                        <Text style={{color : "black"}}>₹ {subtotal.toFixed(2)}</Text>
                    </View>

                    {foodSubtotal > 0 && hasGST && (
                        <View style={styles.rowBetween}>
                            <Text style={{color : "black"}}>GST (5%)</Text>
                            <Text style={{color : "black"}}>₹ {gst.toFixed(2)}</Text>
                        </View>
                    )}

                    {liquorSubtotal > 0 && hasVAT && (
                        <View style={styles.rowBetween}>
                            <Text style={{color : "black"}}>VAT (10%)</Text>
                            <Text style={{color : "black"}}>₹ {vat.toFixed(2)}</Text>
                        </View>
                    )}

                    <View style={styles.totalDivider} />

                    <View style={styles.rowBetween}>
                        <Text style={styles.totalText}>
                            Grand Total
                        </Text>
                        <Text style={styles.totalAmount}>
                            ₹ {total.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {cartItems.length > 0 && (
                <View style={styles.bottomBar}>
                    {isDineIn && (
                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={handlePrintKOT}
                        >
                            <Text>Print KOT</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => setConfirmVisible(true)}
                    >
                        <Text style={{ color: "#fff" }}>
                            Proceed To Billing
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal visible={confirmVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>

                        {/* Header */}
                        <Text style={styles.modalTitle}>
                            Confirm Billing
                        </Text>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Total Section */}
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>Grand Total</Text>
                            <Text style={styles.totalAmount}>
                                ₹ {total.toFixed(2)}
                            </Text>
                        </View>

                        {/* Buttons */}
                        <View style={styles.buttonRow}>

                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setConfirmVisible(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.confirmBtn}
                                onPress={handleConfirmBilling}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.confirmText}>
                                    Confirm & Print
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            </Modal>


        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        // backgroundColor: "#F8FAFC",
    },

    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color : "black"
    },

    emptyText: {
        textAlign: "center",
        color: "#64748B",
    },

    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },

    itemName: {
        fontWeight: "600",
        fontSize: 15,
        color : "black"
    },

    itemPrice: {
        fontSize: 13,
        color: "#64748B",
        color : "black"
    },

    newTag: {
        color: "red",
        fontSize: 11,
        fontWeight: "bold",
    },

    qtyBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        color : "black"
    },

    qtyText: {
        fontWeight: "bold",
        fontSize: 16,
        color : "black"
    },

    divider: {
        height: 1,
        backgroundColor: "#CBD5E1",
        marginVertical: 15,
    },

    newItemsTitle: {
        textAlign: "center",
        fontWeight: "bold",
        color: "red",
        marginBottom: 10,
    },

    totalBox: {
        backgroundColor: "#E2E8F0",
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
    },

    rowBetween: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // marginVertical: 3,
        color : "black"
    },

    totalDivider: {
        height: 1,
        backgroundColor: "#94A3B8",
        marginVertical: 8,
    },

    totalText: {
        fontWeight: "bold",
        fontSize: 16,
        color : "black"
    },

    totalAmount: {
        fontWeight: "bold",
        fontSize: 18,
    },

    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
    },

    primaryBtn: {
        backgroundColor: "#1E293B",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },

    secondaryBtn: {
        backgroundColor: "#E5E7EB",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    modalBox: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0f172a",
        textAlign: "center",
    },

    divider: {
        height: 1,
        backgroundColor: "#E2E8F0",
        marginVertical: 18,
    },

    totalContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 25,
        color :  "black"
    },

    totalLabel: {
        fontSize: 20,
        color: "#64748B",
        color : "black"
        // marginBottom: 6,
    },

    totalAmount: {
        fontSize: 28,
        fontWeight: "800",
        color: "#EE5E1E",
    },

    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },

    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: "#CBD5E1",
        alignItems: "center",
    },

    cancelText: {
        fontWeight: "600",
        color: "#475569",
    },

    confirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: "#EE5E1E",
        alignItems: "center",

        shadowColor: "#EE5E1E",
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },

    confirmText: {
        fontWeight: "700",
        color: "#fff",
    },
});