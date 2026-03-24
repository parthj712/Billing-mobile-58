import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";
import { Text, Card, Snackbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { socket } from "../lib/socket";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFeedbackLink, getShopInfo } from "../services/shopService";
import { Animated, Easing } from "react-native";
import { SnackbarContext } from "../context/SnackbarContext";
import PrinterSetupScreen from "./PrinterSetupScreen";
import AddMenuScreen from "./AddMenuScreen";


export default function HomeScreen() {


    const fetchFeedbackLink = async () => {
        try {
            const res = await getFeedbackLink();

            console.log("Feedback API Response:", res.data.feedbackUrl);

        } catch (error) {
            console.log("Feedback API Error:", error?.response?.data || error);
        }
    };

    useEffect(() => {
        fetchFeedbackLink();
    }, []);

    const insets = useSafeAreaInsets();

    const { showSnackbar } = useContext(SnackbarContext);

    // showSnackbar("Data refreshed", "success");
    // showSnackbar("Network error", "error");


    const [currentHour, setCurrentHour] = useState(new Date().getHours());

    const [printerVisible, setPrinterVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    const [shopData, setShopData] = useState(null);
    const isDineIn = shopData?.businessCategory === "DINE_IN";

    const showTables =
        shopData?.businessCategory === "DINE_IN" ||
        shopData?.businessCategory === "RESTO_BAR";

    const navigation = useNavigation();

    const [refreshing, setRefreshing] = useState(false);
    const rotateAnim = useState(new Animated.Value(0))[0];


    const [snackVisible, setSnackVisible] = useState(false);
    const [snackMessage, setSnackMessage] = useState("");


    const showToast = (message) => {
        setSnackMessage(message);
        setSnackVisible(true);
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            startRotation();

            socket.emit("requestLatestData");

            await new Promise(resolve => setTimeout(resolve, 2000));

            showSnackbar("Data refreshed successfully", "success");

        } catch (err) {
            showSnackbar("Something went wrong", "error");
        } finally {
            setRefreshing(false);
            rotateAnim.stopAnimation();
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const hour = new Date().getHours();
            setCurrentHour(hour);
        }, 60000); // update every 1 minute

        return () => clearInterval(interval); // cleanup
    }, []);


    const getGreeting = () => {
        if (currentHour < 12) return "Good Morning ☀️";
        if (currentHour < 17) return "Good Afternoon 🌤️";
        if (currentHour < 21) return "Good Evening 🌇";
        return "Good Night 🌙";
    };


    const fetchShopData = async () => {
        try {
            const res = await getShopInfo();
            setShopData(res?.data?.data);
            console.log("Shop data:", res?.data?.data); // Debugging line
        } catch (error) {
            console.log("Shop fetch error", error);
            setShopData({}); // fallback
        }
    };;

    useEffect(() => {
        fetchShopData();
    }, []);

    if (!shopData) return null; // prevent flicker


    const startRotation = () => {
        rotateAnim.setValue(0);

        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };



    return (
        <>

            {/* Header */}
            <LinearGradient
                colors={["#E65100", "#F57C00"]}
                style={[
                    styles.header,
                    { paddingTop: insets.top + 8 } // adjust 8 if needed
                ]}
            >
                <Text style={styles.welcome}>
                    {getGreeting()} 👋
                </Text>
            </LinearGradient>

            <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
                <ScrollView contentContainerStyle={styles.container}>


                    {/* Quick Actions */}
                    <Text style={styles.sectionTitle}>Quick Actions</Text>


                    <View style={styles.gridContainer}>
                        <TakeawayButton
                            icon="table-restaurant"
                            label={showTables ? "Add Takeaway Order" : "Add Order"}
                            onPress={() =>
                                navigation.navigate("Orders", {
                                    orderType: "TAKEAWAY",
                                })
                            }
                        />

                        <ActionButton
                            icon="description"
                            label="Add Menu"
                            onPress={() => setMenuVisible(true)}
                        />

                        {/* <ActionButton
                            icon="description"
                            label="Bills"
                            onPress={() => navigation.navigate("Bills")}
                        /> */}


                        <ActionButton
                            icon="print"
                            label="Printer "
                            onPress={() => setPrinterVisible(true)}
                        />


                        <TouchableOpacity style={styles.actionButton} onPress={handleRefresh}>
                            <Animated.View
                                style={{
                                    transform: [{
                                        rotate: rotateAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ["0deg", "360deg"],
                                        })
                                    }]
                                }}
                            >
                                <MaterialIcons name="refresh" size={28} color="#fff" />
                            </Animated.View>
                            <Text style={styles.actionText}>Refresh</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>



                <Snackbar
                    visible={snackVisible}
                    onDismiss={() => setSnackVisible(false)}
                    duration={2500}
                    style={{ backgroundColor: "#1e293b" }}
                >
                    <Text style={{ color: "#fff" }}>{snackMessage}</Text>
                </Snackbar>
            </SafeAreaView>



            <Modal
                visible={printerVisible}
                transparent
                animationType="slide"
            >
                <View style={styles.printerOverlay}>
                    <View style={styles.printerModal}>

                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setPrinterVisible(false)}
                        >
                            <Text style={{ fontWeight: "bold", fontSize: 16, color: "black" }}>Close</Text>
                        </TouchableOpacity>

                        {/* Printer Setup Screen */}
                        <PrinterSetupScreen />

                    </View>
                </View>
            </Modal>

            <Modal
                visible={menuVisible}
                transparent
                animationType="slide"
            >
                <View style={styles.printerOverlay}>
                    <View style={styles.printerModal}>

                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setMenuVisible(false)}
                        >
                            <Text style={{ fontWeight: "bold", fontSize: 16, color: "black" }}>Close</Text>
                        </TouchableOpacity>

                        {/* Printer Setup Screen */}
                        <AddMenuScreen />

                    </View>
                </View>
            </Modal>
        </>
    );
}

/* ---------------- Components ---------------- */

const StatCard = ({ label, value, icon }) => (
    <View style={styles.statCard}>
        <MaterialIcons name={icon} size={26} color="#EE5E1E" />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const ActionButton = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <MaterialIcons name={icon} size={28} color="#fff" />
        <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
);

const TakeawayButton = ({ icon, label, onPress }) => (
    <TouchableOpacity
        style={styles.takeawayWrapper}
        activeOpacity={0.8}
        onPress={onPress}
    >
        <LinearGradient
            colors={["#F97316", "#EA580C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.takeawayButton}
        >
            <MaterialIcons name={icon} size={30} color="#fff" />
            <Text style={styles.takeawayText}>{label}</Text>
        </LinearGradient>
    </TouchableOpacity>
);

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
    header: {
        paddingVertical: 20,
        paddingHorizontal: 20,

    },
    welcome: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    username: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 5,
    },
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginHorizontal: 5,
        elevation: 3,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 5,
    },
    statLabel: {
        fontSize: 14,
        color: "#64748B",
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 10,
        color: "#0f172a",
    },
    card: {
        marginBottom: 15,
        borderRadius: 12,
    },
    orderCount: {
        fontSize: 16,
        fontWeight: "600",
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    actionButton: {
        flex: 1,
        backgroundColor: "#1E293B",
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
        marginHorizontal: 5,
    },
    actionText: {
        color: "#fff",
        marginTop: 8,
        fontWeight: "600",
    },
    takeawayText: {
        color: "#fff",
        marginTop: 8,
        fontWeight: "700",
        fontSize: 18,
        textAlign: "center",
        alignItems: "center",
    },
    takeawayWrapper: {
        width: "100%",
        marginBottom: 15,
    },

    takeawayButton: {

        paddingVertical: 18,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    printerOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },

    printerModal: {
        height: "85%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },

    closeBtn: {
        alignSelf: "flex-end",
        marginBottom: 10,
    },
    PrintersectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#64748b",
        marginBottom: 8,
        marginTop: 20,
    },

    card: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: "#fff",
        elevation: 1.5,
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 10,
    },

    actionButton: {
        width: "30%",
        backgroundColor: "#1E293B",
        paddingVertical: 20,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 12,
    },
});