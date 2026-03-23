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
import { getRecentBills } from "../services/billsService"; // ✅ adjust path

export default function BillingScreen() {

    const insets = useSafeAreaInsets();

    const [recentBills, setRecentBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false); // 🔥 important


    

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

            const res = await getRecentBills();
            const data = res?.data?.data || [];

            setRecentBills(data);
            setLoaded(true);
        } catch (error) {
            console.log("Recent Bills Error:", error?.message);
        } finally {
            setLoading(false);
        }
    };

    const renderBillItem = ({ item }) => (
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
                <Text style={{ fontWeight: "600", fontSize: 16 }}>
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

            <Text
                style={{
                    marginTop: 4,
                    color: "#666",
                    fontSize: 14,
                }}
            >
                Table {item.tableNo} • {item.time}
            </Text>
        </View>
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

                    <TouchableOpacity
                        style={styles.refreshButton}
                        activeOpacity={0.85}
                        onPress={fetchBills}
                    >
                        <Text style={styles.refreshText}>
                            {loaded ? "Refresh" : "Load Bills"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>


            <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
                <View style={{ flex: 1, padding: 16 }}>
                    {/* 🔥 Before Loading */}
                    {!loaded && !loading && (
                        <Text
                            style={{
                                textAlign: "center",
                                marginTop: 40,
                                color: "#666",
                            }}
                        >
                            Click "Load Bills" to view recent bills.
                        </Text>
                    )}

                    {/* 🔥 Loading */}
                    {loading && (
                        <ActivityIndicator
                            size="large"
                            color="#EE5E1E"
                            style={{ marginTop: 40 }}
                        />
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
                    {loaded && !loading && recentBills.length > 0 && (
                        <FlatList
                            data={recentBills}
                            keyExtractor={(item, index) =>
                                item._id?.toString() || item.billNo?.toString() || index.toString()
                            }
                            renderItem={renderBillItem}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
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

});