import React, { useMemo, useState, useEffect, useContext, useRef } from "react";
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
import ViewShot from "react-native-view-shot";
import { BillDesign } from "../BillDesign";
import { KOTDesign } from "../KOTDesign";



export default function OrderCart({
    tableId,
    orderType,
    tableNo,
    sectionName,
    onBack,
    refreshTrigger,   // ✅ ADD THIS
    onCartUpdate
}) {

    const viewShotRef = useRef();
    const kotShotRef = useRef();

    const isDineIn = orderType === "DINE-IN";

    const showTables =
        shopData?.businessCategory === "DINE_IN" ||
        shopData?.businessCategory === "RESTO_BAR";


    const { showSnackbar } = useContext(SnackbarContext);

    const { printerSettings } = useContext(PrinterContext);


    // ✅ Add here
    const billingPrinter = printerSettings?.billingPrinter;
    const kotPrinter = printerSettings?.kotPrinter || billingPrinter;

    const paperWidthDots = printerSettings?.paperWidthDots || 576; // 384 default

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [shopData, setShopData] = useState(null);
    const [customerName, setCustomerName] = useState("");


    const [paymentMethod, setPaymentMethod] = useState("CASH");


    const [feedbackUrl, setFeedbackUrl] = useState(null);

    const [discountPercent, setDiscountPercent] = useState(0);


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

                console.log("fetchActiveTakaway", res?.data)

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

            loadOrder();
            showSnackbar("Item quantity increased", "success");
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
            showSnackbar("Item quantity decreased", "success");
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
    console.log("hasgst", hasGST)
    const hasVAT = !!shopData?.vatNumber;
    console.log("hasVAT", hasVAT)

    // const gst = hasGST ? foodSubtotal * (GST_PERCENT / 100) : 0;

    // const cgst = hasGST ? foodSubtotal * (GST_PERCENT / 2 / 100) : 0;
    // const sgst = hasGST ? foodSubtotal * (GST_PERCENT / 2 / 100) : 0;

    // const gst = cgst + sgst; // total GST
    // const vat = hasVAT ? liquorSubtotal * (VAT_PERCENT / 100) : 0;

    // // 🔥 ROUND OFF
    // const discountAmount = subtotal * (discountPercent / 100);

    // const rawTotal = subtotal + gst + vat - discountAmount;

    // const roundedTotal = Math.round(rawTotal);
    // const roundOff = roundedTotal - rawTotal;

    // const total = roundedTotal;

    // const vat = hasVAT ? liquorSubtotal * (VAT_PERCENT / 100) : 0;

    // const total = subtotal + gst + vat;


    // Step 1: Discount first
    const discountAmount = subtotal * (discountPercent / 100);

    const discountedSubtotal = subtotal - discountAmount;

    // Step 2: Apply tax on discounted amount
    const cgst = hasGST ? discountedSubtotal * (GST_PERCENT / 2 / 100) : 0;
    const sgst = hasGST ? discountedSubtotal * (GST_PERCENT / 2 / 100) : 0;

    const gst = cgst + sgst;

    const vat = hasVAT ? discountedSubtotal * (VAT_PERCENT / 100) : 0;

    // Step 3: Final
    const rawTotal = discountedSubtotal + gst + vat;

    const roundedTotal = Math.round(rawTotal);
    const roundOff = roundedTotal - rawTotal;

    const total = roundedTotal;

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
                    printerSettings,
                    kotShotRef
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

            await finalizeBillAndOrder({ tableId, orderType, paymentMethod });


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

                printBillSmart(
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
        <View key={item._id} style={[
            styles.itemRow,
            highlight && styles.newItemRow   // 🔥 ADD THIS
        ]}>
            <View>
                <View>
                    <Text style={styles.itemName}>
                        {item.name}
                    </Text>


                    {item.variantName && (
                        <Text style={styles.subText}>
                            {item.variantName}
                        </Text>


                    )}

                    {item.portion && (
                        <Text style={styles.subText}>
                            {item.portion}
                        </Text>
                    )}
                </View>
                <Text style={styles.qtyText}>
                    Qty : {item.qty} • ₹{item.price}
                </Text>


                {highlight && (
                    <Text style={styles.newTag}>NEW ITEM</Text>
                )}
            </View>

            <View style={styles.qtyBox}>
                <TouchableOpacity
                    onPress={() => decreaseQty(item)}   // or deleteItem(item)
                    style={styles.deleteBtn}
                >
                    <MaterialIcons name="delete-outline" size={18} color="#DC2626" />
                </TouchableOpacity>


                {/* <TouchableOpacity onPress={() => increaseQty(item)}>
                    <MaterialIcons name="add" size={20} color="black" />
                </TouchableOpacity> */}
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

                {newItems.length > 0 && (
                    <>
                        {/* <Text style={styles.newItemsTitle}>
                            New Items
                        </Text> */}


                        {newItems.map((item) => renderItem(item, true))}
                        {/* <View style={styles.divider} /> */}
                    </>
                )}


                {printedItems.map((item) => renderItem(item, false))}


                {/* subtotal box */}
                {/* <View style={styles.totalBox}>
                    <View style={styles.rowBetween}>
                        <Text style={{ color: "black" }}>Subtotal</Text>
                        <Text style={{ color: "black" }}>₹ {subtotal.toFixed(2)}</Text>
                    </View>

                    {foodSubtotal > 0 && hasGST && (
                        <>
                            <View style={styles.rowBetween}>
                                <Text style={{ color: "black" }}>CGST (2.5%)</Text>
                                <Text style={{ color: "black" }}>₹ {cgst.toFixed(2)}</Text>
                            </View>

                            <View style={styles.rowBetween}>
                                <Text style={{ color: "black" }}>SGST (2.5%)</Text>
                                <Text style={{ color: "black" }}>₹ {sgst.toFixed(2)}</Text>
                            </View>
                        </>
                    )}

                    {liquorSubtotal > 0 && hasVAT && (
                        <View style={styles.rowBetween}>
                            <Text style={{ color: "black" }}>VAT (10%)</Text>
                            <Text style={{ color: "black" }}>₹ {vat.toFixed(2)}</Text>
                        </View>
                    )}



                    {roundOff !== 0 && (
                        <View>
                            <View style={styles.totalDivider} />

                            <View style={styles.rowBetween}>
                                <Text style={{ color: "black" }}>Round Off</Text>
                                <Text style={{ color: "black" }}>
                                    ₹ {roundOff > 0 ? "+" : ""}
                                    {roundOff.toFixed(2)}
                                </Text>
                            </View>

                            <View style={styles.totalDivider} />
                        </View>
                    )}



                    <View style={styles.rowBetween}>
                        <Text style={styles.totalText}>
                            Grand Total
                        </Text>
                        <Text style={styles.totalAmount}>
                            ₹ {total.toFixed(2)}
                        </Text>
                    </View>
                </View> */}
            </ScrollView>


            {/* print kot button */}

            {cartItems.length > 0 && (
                <View style={styles.bottomBar}>
                    {isDineIn && (
                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={handlePrintKOT}
                        >
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>Send to Kitchen</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => setConfirmVisible(true)}
                    >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                            Proceed To Billing
                        </Text>
                    </TouchableOpacity>
                </View>
            )}


            {/* //confiirm billing modal */}
            <Modal visible={confirmVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        >

                            {/* Header */}
                            <Text style={styles.modalTitle}>
                                Confirm Billing
                            </Text>

                            {/* Divider */}
                            <View style={styles.divider} />

                            <Text style={{ fontWeight: "bold", marginBottom: 10, color: "black" }}>
                                Select Discount
                            </Text>

                            <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                                {[0, 5, 10, 15].map((percent) => {
                                    const isSelected = discountPercent === percent;

                                    return (
                                        <TouchableOpacity
                                            key={percent}
                                            onPress={() => setDiscountPercent(percent)}
                                            style={{
                                                paddingVertical: 8,
                                                paddingHorizontal: 12,
                                                borderRadius: 10,

                                                backgroundColor: isSelected ? "#0F172A" : "#F1F5F9",

                                                shadowColor: "#000",
                                                shadowOpacity: 0.1,
                                                shadowRadius: 4,
                                                elevation: 2,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: isSelected ? "#fff" : "#334155",
                                                    fontWeight: "600",
                                                    fontSize: 12
                                                }}
                                            >
                                                {percent === 0 ? "No Disc" : `${percent}%`}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>


                            <View style={{
                                backgroundColor: "#F8FAFC",
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 20
                            }}>

                                {/* Subtotal */}
                                <View style={styles.rowBetween}>
                                    <Text style={{ color: "black" }}>Subtotal</Text>
                                    <Text style={{ color: "black" }}>₹ {subtotal.toFixed(2)}</Text>
                                </View>

                                {/* Discount */}
                                {discountPercent > 0 && (
                                    <View style={styles.rowBetween}>
                                        <Text style={{ color: "red" }}>
                                            Discount ({discountPercent}%)
                                        </Text>
                                        <Text style={{ color: "red" }}>
                                            -₹ {discountAmount.toFixed(2)}
                                        </Text>
                                    </View>
                                )}

                                {/* Divider */}
                                <View style={styles.totalDivider} />

                                {/* CGST */}
                                {cgst > 0 && (
                                    <View style={styles.rowBetween}>
                                        <Text>CGST (2.5%)</Text>
                                        <Text>₹ {cgst.toFixed(2)}</Text>
                                    </View>
                                )}

                                {/* SGST */}
                                {sgst > 0 && (
                                    <View style={styles.rowBetween}>
                                        <Text>SGST (2.5%)</Text>
                                        <Text>₹ {sgst.toFixed(2)}</Text>
                                    </View>
                                )}

                                {/* VAT */}
                                {vat > 0 && (
                                    <View style={styles.rowBetween}>
                                        <Text>VAT (10%)</Text>
                                        <Text>₹ {vat.toFixed(2)}</Text>
                                    </View>
                                )}

                                {/* Round Off */}
                                {roundOff !== 0 && (
                                    <View style={styles.rowBetween}>
                                        <Text>Round Off</Text>
                                        <Text>
                                            ₹ {roundOff > 0 ? "+" : ""}
                                            {roundOff.toFixed(2)}
                                        </Text>
                                    </View>
                                )}

                                {/* Divider */}
                                <View style={styles.totalDivider} />

                                {/* Grand Total */}
                                <View style={styles.rowBetween}>
                                    <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                                        Grand Total
                                    </Text>
                                    <Text style={{
                                        fontWeight: "800",
                                        fontSize: 22,
                                        color: "#EA580C"
                                    }}>
                                        ₹ {total.toFixed(2)}
                                    </Text>
                                </View>

                            </View>


                            <Text style={{ fontWeight: "bold", marginBottom: 10, color: "black" }}>
                                Payment Method
                            </Text>

                            <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>

                                {/* CASH */}
                                <TouchableOpacity
                                    onPress={() => setPaymentMethod("CASH")}
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        borderRadius: 10,
                                        borderWidth: 2,
                                        borderColor: paymentMethod === "CASH" ? "green" : "#ccc",
                                        backgroundColor: paymentMethod === "CASH" ? "#ECFDF5" : "#fff",
                                        alignItems: "center"

                                    }}
                                >
                                    <Text style={{ fontSize: 18 }}>💵</Text>
                                    <Text style={{ fontWeight: "bold", color: "black" }}>Cash</Text>
                                </TouchableOpacity>

                                {/* UPI */}
                                <TouchableOpacity
                                    onPress={() => setPaymentMethod("UPI")}
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        borderRadius: 10,
                                        borderWidth: 2,
                                        borderColor: paymentMethod === "UPI" ? "#2563eb" : "#ccc",
                                        backgroundColor: paymentMethod === "UPI" ? "#EFF6FF" : "#fff",
                                        alignItems: "center"
                                    }}
                                >
                                    <Text style={{ fontSize: 18 }}>📱</Text>
                                    <Text style={{ fontWeight: "bold", color: "black" }}>UPI</Text>
                                </TouchableOpacity>

                                {/* CARD */}
                                <TouchableOpacity
                                    onPress={() => setPaymentMethod("CARD")}
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        borderRadius: 10,
                                        borderWidth: 2,
                                        borderColor: paymentMethod === "CARD" ? "#9333EA" : "#ccc",  // ✅ FIX
                                        backgroundColor: paymentMethod === "CARD" ? "#F3E8FF" : "#fff", // ✅ FIX
                                        alignItems: "center"
                                    }}
                                >
                                    <Text style={{ fontSize: 18 }}>💳</Text>
                                    <Text style={{ fontWeight: "bold", color: "black" }}>CARD</Text>
                                </TouchableOpacity>

                            </View>

                            {/* Total Section */}
                            <View style={{
                                backgroundColor: "#ffe8cb",
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 20
                            }}>
                                <Text style={{ color: "#64748B", fontSize: 14 }}>
                                    Grand Total
                                </Text>

                                <Text style={{
                                    fontSize: 32,
                                    fontWeight: "800",
                                    color: "#EA580C",
                                    marginTop: 4
                                }}>
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

                        </ScrollView>
                    </View>
                </View>
            </Modal>



            <ViewShot
                ref={viewShotRef}
                collapsable={false}
                style={{
                    position: "absolute",
                    opacity: 0,
                    zIndex: -1,
                }}
                pointerEvents="none"
            >
                <BillDesign
                    items={cartItems}
                    total={total}
                    subtotal={subtotal}
                    cgst={cgst}
                    sgst={sgst}
                    vat={vat}
                    roundOff={roundOff}
                    shopData={shopData}
                    customerName={customerName}
                    orderType={orderType}
                    feedbackUrl={feedbackUrl}
                    sectionName={sectionName}
                    paperWidth={paperWidthDots}
                    paymentMethod={paymentMethod}
                    discountPercent={discountPercent}
                />
            </ViewShot>


            <ViewShot
                ref={kotShotRef}
                collapsable={false}
                style={{
                    position: "absolute",
                    opacity: 0,
                    zIndex: -1,
                }}
                pointerEvents="none"
            >

                <KOTDesign
                    tableNo={tableNo}
                    items={newItems}
                    shopName={shopData?.shopName}
                    orderType={orderType}
                    sectionName={sectionName}
                />
            </ViewShot>




        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#F8FAFC",
    },

    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "black"
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
        padding: 14,
        borderRadius: 16,
        marginBottom: 12,

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,

        borderWidth: 1,
        borderColor: "#F1F5F9",
    },

    newItemRow: {
        borderLeftWidth: 4,
        borderLeftColor: "#F97316",
        backgroundColor: "#FFF7ED",
    },

    itemName: {
        fontWeight: "700",
        fontSize: 16,
        color: "#0F172A",
    },

    itemPrice: {
        fontSize: 13,
        color: "#64748B",
        color: "black"
    },

    newTag: {
        marginTop: 6,
        alignSelf: "flex-start",
        backgroundColor: "#FEF2F2",
        color: "#DC2626",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        fontSize: 11,
        fontWeight: "600",
    },

    qtyBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        color: "black"
    },

    qtyText: {
        fontWeight: "bold",
        fontSize: 16,
        color: "black"
    },

    divider: {
        height: 1,
        backgroundColor: "#CBD5E1",
        marginVertical: 15,
    },

    // newItemsTitle: {
    //     textAlign: "center",
    //     fontWeight: "bold",
    //     color: "red",
    //     marginBottom: 10,
    //     fontSize: 20
    // },

    totalBox: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 16,
        marginTop: 20,

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },

    rowBetween: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // marginVertical: 3,
        color: "black"
    },

    totalDivider: {
        height: 1,
        backgroundColor: "#94A3B8",
        marginVertical: 8,
    },

    totalText: {
        fontWeight: "bold",
        fontSize: 16,
        color: "black"
    },

    totalAmount: {
        fontWeight: "800",
        fontSize: 22,
        color: "#16A34A", // green = money feel
    },

    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
        backgroundColor: "#fff", // 🔥 ADD
        borderTopWidth: 1,       // 🔥 ADD
        borderColor: "#E2E8F0",
    },

    primaryBtn: {
        backgroundColor: "#ff954a",
        padding: 16,
        borderRadius: 18,
        alignItems: "center",
        marginTop: 16,
        fontWeight: "bold",

        shadowColor: "#F97316",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },

    secondaryBtn: {
        backgroundColor: "#232c3f",
        padding: 14,
        borderRadius: 14,
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
        backgroundColor: "#ffffff",
        borderRadius: 28,
        padding: 24,

        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 25,
        shadowOffset: { width: 0, height: 10 },
        elevation: 12,
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
        color: "black"
    },

    totalLabel: {
        fontSize: 20,
        color: "#64748B",
        color: "black"
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
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },

    confirmText: {
        fontWeight: "700",
        color: "#fff",
    },
    deleteBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#FEE2E2", // light red

        justifyContent: "center",
        alignItems: "center",
    },
    subText: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "500",
    },
});