import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Button, Text, Avatar, Card, Divider } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import { getShopInfo } from "../services/shopService";
import { useNavigation } from "@react-navigation/native";
import PrinterSetupScreen from "./PrinterSetupScreen";
import { List } from "react-native-paper";


export default function ProfileScreen() {

    const navigation = useNavigation();

    const { logout, user } = useContext(AuthContext);

    const [printerVisible, setPrinterVisible] = useState(false);

    const [logoutVisible, setLogoutVisible] = useState(false);
    const insets = useSafeAreaInsets();

    const [shopData, setShopData] = useState(null);

    const handleLogout = () => {
        setLogoutVisible(true);
    };

    const getInitial = () => {
        if (!user?.email) return "U";
        return user.email.charAt(0).toUpperCase();
    };


    const fetchShopData = async () => {
        try {
            const res = await getShopInfo();
            setShopData(res?.data?.data);
            // console.log("Shop data:", res?.data?.data); // Debugging line
        } catch (error) {
            console.log("Shop fetch error", error);
            setShopData({}); // fallback
        }
    };

    useEffect(() => {
        fetchShopData();
    }, []);

    // console.log("Shop data:", shopData); // Debugging line


    return (
        <>
            {/* Header */}
            <LinearGradient
                colors={["#EE5E1E", "#F27D23"]}
                style={[
                    styles.header,
                    { paddingTop: insets.top + 8 } // adjust 8 if needed
                ]}
            >
                <Text style={styles.headerTitle}>Profile</Text>
            </LinearGradient>


            <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
                {/* Body */}
                <View style={styles.container}>
                    {/* Profile Card */}
                    <View style={styles.container}>

                        {/* ACCOUNT SECTION */}
                        <Text style={styles.sectionTitle}>Account</Text>

                        <Card style={styles.card}>

                            <List.Item
                                title="Shop Name"
                                description={shopData?.shopName || "Not Available"}
                                titleStyle={{ color: "black" }}
                                descriptionStyle={{ color: "black" }}
                                left={() => <List.Icon icon="storefront-outline" color="black" />}
                            />


                            <List.Item
                                title="Username"
                                description={user?.userName || user?.email?.split("@")[0] || "Not Available"}
                                titleStyle={{ color: "black" }}
                                descriptionStyle={{ color: "black" }}
                                left={() => <List.Icon icon="account-circle-outline" color="black" />}
                            />

                            <List.Item
                                title="Role"
                                description={user?.role || "CAPTAIN"}
                                titleStyle={{ color: "black" }}
                                descriptionStyle={{ color: "black" }}
                                left={() => <List.Icon icon="account-outline" color="black" />}
                            />


                        </Card>


                        {/* SETTINGS SECTION */}
                        <Text style={styles.sectionTitle}>Settings</Text>

                        <Card style={styles.card}>
                            <List.Item
                                title="Printer Settings"
                                left={() => <List.Icon icon="printer" color="black" />}
                                right={() => <List.Icon icon="chevron-right" color="black" />}
                                titleStyle={{ color: "black" }}
                                descriptionStyle={{ color: "black" }}
                                onPress={() => setPrinterVisible(true)}
                            />

                            <Divider />

                            <List.Item
                                title="App Version"
                                description="1.1.0"
                                titleStyle={{ color: "black" }}
                                descriptionStyle={{ color: "black" }}
                                left={() => <List.Icon icon="information-outline" color="black" />}
                            />
                        </Card>


                        {/* DANGER ZONE */}
                        <Text style={styles.sectionTitle}>Sign Out</Text>

                        <Card style={styles.card}>
                            <List.Item
                                title="Sign Out"
                                titleStyle={{ color: "#dc2626", fontWeight: "600" }}
                                left={() => <List.Icon icon="logout" color="#dc2626" />}
                                onPress={handleLogout}
                            />
                        </Card>

                    </View>

                    {/* <Button
                        mode="outlined"
                        icon="printer"
                        onPress={() => setPrinterVisible(true)}
                        style={styles.printerButton}
                    >
                        Printer Settings
                    </Button> */}

                </View>
            </SafeAreaView>


            <Modal visible={logoutVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>

                        <Text style={styles.modalTitle}>Sign Out</Text>

                        <Text style={styles.modalMessage}>
                            Are you sure you want to sign out from your account?
                        </Text>

                        <View style={styles.modalButtonRow}>

                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setLogoutVisible(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.logoutBtn}
                                // onPress={logout}
                                onPress={async () => {
                                    await logout();
                                    setLogoutVisible(false); // ✅ close modal
                                }}
                            >
                                <Text style={styles.logoutText}>
                                    Sign Out
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>
                </View>
            </Modal>



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
                        <PrinterSetupScreen closeModal={() => setPrinterVisible(false)} />

                    </View>
                </View>
            </Modal>


            {/* <TouchableOpacity
                style={styles.settingBtn}
                onPress={() => navigation.navigate("PrinterSettings")}
            >
                <Text>Printer Settings</Text>
            </TouchableOpacity> */}
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingVertical: 18,
        paddingHorizontal: 20,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "white",
        letterSpacing: 0.5,
    },

    container: {
        flex: 1,
        paddingHorizontal: 12,
        // paddingTop: 25,
    },

    card: {
        borderRadius: 24,
        padding: 25,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
        color: "black"
    },

    avatarContainer: {
        alignItems: "center",
        marginBottom: 18,
    },

    nameText: {
        textAlign: "center",
        fontSize: 20,
        fontWeight: "700",
        color: "#0f172a",
    },

    emailText: {
        textAlign: "center",
        fontSize: 14,
        color: "#64748b",
        marginTop: 4,
    },

    roleBadge: {
        marginTop: 12,
        alignSelf: "center",
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 50,
        backgroundColor: "#eef2ff",
        color: "#4f46e5",
        fontWeight: "700",
        letterSpacing: 0.5,
        fontSize: 12,
    },

    infoRow: {
        marginBottom: 16,
    },

    label: {
        fontSize: 12,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: 1,
    },

    value: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1e293b",
        marginTop: 4,
    },

    logoutButton: {
        // marginTop: 35,
        borderRadius: 18,
        backgroundColor: "#dc2626",
        shadowColor: "#dc2626",
        shadowOpacity: 0.25,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
        color: "#ffffff",
        fontWeight: "600",
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
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 12,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 10,
        color: "#0f172a",
    },

    modalMessage: {
        fontSize: 15,
        textAlign: "center",
        color: "#64748b",
        marginBottom: 25,
    },

    modalButtonRow: {
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

    logoutBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: "#dc2626",
        alignItems: "center",

        shadowColor: "#dc2626",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },

    logoutText: {
        fontWeight: "700",
        color: "#ffffff",
    },
    printerButton: {

        paddingVertical: 6,
        marginTop: 20,
        borderRadius: 12,
        borderColor: "#1E293B",
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
    sectionTitle: {
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
});