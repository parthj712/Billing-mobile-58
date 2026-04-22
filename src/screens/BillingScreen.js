import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { getBills, getRecentBills } from "../services/billsService"; // ✅ adjust path
import { Modal, ScrollView } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function BillingScreen() {

    const insets = useSafeAreaInsets();

    const [recentBills, setRecentBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false); // 🔥 important


    const [selectedBill, setSelectedBill] = useState(null);
    const [billModal, setBillModal] = useState(false);



    const formatTime = (dateString) => {
        if (!dateString) return "";

        const date = new Date(dateString);

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const fetchBills = async () => {
        try {
            setLoading(true);

            const res = await getBills();

            console.log("FULL API RESPONSE:", res);   // ✅ 1

            const data = res?.data?.data || [];

            console.log("BILLS DATA ARRAY:", data);   // ✅ 2

            if (data.length > 0) {
                console.log("FIRST BILL:", data[0]);  // ✅ 3 (very useful)
            }

            setRecentBills(data);
            setLoaded(true);

        } catch (error) {
            console.log("Recent Bills Error:", error?.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderBillItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                setSelectedBill(item);
                setBillModal(true);
            }}
            activeOpacity={1}
        >
            <View
                style={{
                    backgroundColor: "#F5F5F5",
                    padding: 15,
                    borderRadius: 12,
                    marginBottom: 12,

                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Text style={{ fontWeight: "600", fontSize: 16, color: "black" }}>
                        {item.billNo}
                    </Text>

                    <Text
                        style={{
                            color: "#2E7D32",
                            fontWeight: "bold",
                            fontSize: 16,
                        }}
                    >
                        ₹{item.grandTotal}
                    </Text>
                </View>

                <View
                    style={{
                        marginTop: 6,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Text
                        style={{
                            color: "#666",
                            fontSize: 14,
                        }}
                    >
                        Created At : {formatDateTime(item.createdAt)}
                    </Text>

                    <TouchableOpacity
                        onPress={() => {
                            setSelectedBill(item);
                            setBillModal(true);
                        }}

                    >
                        <Text style={{ color: "#1E293B", fontSize: 14, fontWeight: "600", textDecorationLine: "underline" }}>
                            View Bill
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </TouchableOpacity>
    );

    // console.log("Bills Data:", recentBills);
    return (
        <>
            {/* Header */}
            <LinearGradient
                colors={["#E65100", "#F57C00"]}
                style={[
                    styles.header,
                    { paddingTop: insets.top + 10 },
                ]}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>
                        Recent Bills
                    </Text>

                    {/* <TouchableOpacity
                        style={styles.refreshButton}
                        activeOpacity={0.85}
                        onPress={fetchBills}
                    >
                        <Text style={styles.refreshText}>
                            {loaded ? "Refresh" : "Load Bills"}
                        </Text>
                    </TouchableOpacity> */}
                </View>
            </LinearGradient>


            <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
                <View style={{ flex: 1, padding: 16 }}>
                    {/* 🔥 Before Loading */}
                    {!loaded && !loading && (
                        <Text
                            style={{
                                textAlign: "center",
                                marginTop: 160,
                                color: "#898989",
                                fontWeight: "500",
                                fontSize: 18
                            }}
                        >
                            "Refresh to load recent bills"
                        </Text>
                    )}

                    {/* 🔥 Loading */}
                    {loading && (
                        <View style={{ flex: 1, justifyContent: "flex-start", alignItems: "center" }}>
                            <ActivityIndicator size="large" color="#EE5E1E" />
                        </View>
                    )}

                    {/* 🔥 No Bills Found */}
                    {loaded && !loading && recentBills.length === 0 && (
                        <Text
                            style={{
                                textAlign: "center",
                                marginTop: 40,
                                color: "#666",
                            }}
                        >
                            No recent bills found.
                        </Text>
                    )}

                    {/* 🔥 Bills List */}
                    <FlatList
                        data={recentBills}
                        keyExtractor={(item, index) =>
                            item._id?.toString() || item.billNo?.toString() || index.toString()
                        }
                        renderItem={renderBillItem}
                        showsVerticalScrollIndicator={false}
                        refreshing={loading}
                        onRefresh={fetchBills}

                        ListEmptyComponent={
                            !loading && loaded ? (
                                <Text style={{ textAlign: "center", marginTop: 40, color: "#666" }}>
                                    No recent bills found.
                                </Text>
                            ) : null
                        }
                    />
                </View>




                <Modal visible={billModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.billModalContainer}>

                            {/* Handle */}
                            <View style={styles.modalHeader}>



                                {/* <TouchableOpacity
                                    onPress={() => setBillModal(false)}
                                    style={styles.closeCircle}
                                >
                                    <MaterialIcons name="close" size={20} color="#DC2626" style={{ textAlign: "center" }} />
                                </TouchableOpacity> */}

                            </View>

                            {/* Header */}
                            <Text style={styles.billTitle}>
                                {selectedBill?.billNo}
                            </Text>

                            <Text style={styles.billSub}>
                                {new Date(selectedBill?.createdAt).toLocaleString("en-IN")}
                            </Text>

                            {/* Items */}
                            <ScrollView style={{ maxHeight: 250 }}>
                                {selectedBill?.items?.map((item, index) => (
                                    <View key={index} style={styles.itemRow}>
                                        <Text style={styles.itemName}>
                                            {item.name} x {item.qty}
                                        </Text>
                                        <Text style={styles.itemPrice}>
                                            ₹{item.total}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Summary */}
                            <View style={styles.summaryRow}>
                                <Text style={{ color: "#0f172a" }}>Subtotal</Text>
                                <Text style={{ color: "#0f172a" }}>₹{selectedBill?.subtotal}</Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={{ color: "#0f172a" }}>GST</Text>
                                <Text style={{ color: "#0f172a" }}>
                                    ₹{selectedBill?.gstAmount}
                                </Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={styles.totalText}>Total</Text>
                                <Text style={styles.totalAmount}>
                                    ₹{selectedBill?.grandTotal}
                                </Text>
                            </View>

                            {/* Payment */}
                            <View style={styles.paymentBox}>
                                <Text style={{ color: "#64748B" }}>Payment</Text>
                                <Text style={styles.paymentText}>
                                    {selectedBill?.paymentMethod}
                                </Text>
                            </View>

                            {/* Close */}
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => setBillModal(false)}
                            >
                                <Text style={{ color: "#fff", fontWeight: "600" }}>
                                    Close
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </>
    );
}



const styles = StyleSheet.create({
    header: {
        paddingVertical: 18,
        paddingHorizontal: 20,

    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
    },

    refreshButton: {
        backgroundColor: "rgba(255,255,255,0.18)",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },

    refreshText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "600",
    },





    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",   // ✅ THIS FIXES POSITION
    },
    billModalContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },

    billTitle: {
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
        color: "#0f172a",
    },

    billSub: {
        textAlign: "center",
        color: "#0f172a",
        marginBottom: 15,
    },

    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    itemName: {
        color: "#0f172a",
    },

    itemPrice: {
        fontWeight: "600",
        color: "#0f172a",
    },

    divider: {
        height: 1,
        backgroundColor: "#E2E8F0",
        marginVertical: 10,
    },

    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
        color: "#0f172a",
    },

    totalText: {
        fontWeight: "700",
        color: "#0f172a",
    },

    totalAmount: {
        fontWeight: "700",
        fontSize: 18,
        color: "#0f172a",
    },

    paymentBox: {
        marginTop: 10,
        alignItems: "center",
    },

    paymentText: {
        fontWeight: "700",
        fontSize: 16,
        color: "#16a34a",
    },

    closeBtn: {
        marginTop: 15,
        backgroundColor: "#1E293B",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: "#E2E8F0",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",   // ✅ IMPORTANT
        marginBottom: 5,
    },

    closeCircle: {
        width: 32,
        height: 32,
        borderRadius: 20,
        backgroundColor: "#FEE2E2",   // light red
        alignItems: "center",
        justifyContent: "center",
    },

    closeIcon: {
        color: "#DC2626",   // strong red
        fontSize: 16,
        fontWeight: "700",
    },
    closeCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FEE2E2",

        justifyContent: "center",   // vertical center
        alignItems: "center",       // horizontal center

        padding: 0,                 // remove extra spacing
    },
});