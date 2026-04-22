import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
    View,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import LinearGradient from "react-native-linear-gradient";
import TableCard from "../compoenenets/TableCard";
import { getTables } from "../services/tableService";
import { Menu, Button } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { updateTableStatus } from "../services/tableService";
import { Modal, TouchableOpacity } from "react-native";

export default function TablesScreen({ navigation }) {

    const insets = useSafeAreaInsets();

    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedSection, setSelectedSection] = useState("All");
    const [menuVisible, setMenuVisible] = useState(false);


    const [actionModal, setActionModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);



    const fetchTables = async () => {
        try {
            setLoading(true);
            const data = await getTables();
            setTables(data); // adjust if needed
            console.log("Fetched tables:", data);
        } catch (error) {
            console.log("Failed to fetch tables:", error?.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     fetchTables();
    // }, []);

    useFocusEffect(
        useCallback(() => {
            fetchTables();
        }, [])
    );
    const totalActiveTables = tables.filter(
        (t) => t.status === "OCCUPIED"
    ).length;


    const groupedTables = tables.reduce((acc, table) => {
        const section = table.sectionId?.name || "Default";

        if (!acc[section]) {
            acc[section] = [];
        }

        acc[section].push(table);

        return acc;
    }, {});


    const sectionNames = ["All", ...Object.keys(groupedTables)];

    const sections = Object.entries(groupedTables).filter(([name]) =>
        selectedSection === "All" ? true : name === selectedSection
    );

    // const handleTableStatusChange = (table) => {
    //     Alert.alert(
    //         `Table ${table.tableNo}`,
    //         "Select Action",
    //         [
    //             {
    //                 text: "Mark as Available",
    //                 onPress: () => updateStatus(table._id, "AVAILABLE"),
    //             },
    //             {
    //                 text: "Mark as Occupied",
    //                 onPress: () => updateStatus(table._id, "OCCUPIED"),
    //             },
    //             { text: "Cancel", style: "cancel" },
    //         ]
    //     );
    // };


    const handleTableStatusChange = (table) => {
        setSelectedTable(table);
        setActionModal(true);
    };


    const updateStatus = async (tableId, status) => {
        try {
            await updateTableStatus(tableId, status);

            // refresh UI
            fetchTables();

        } catch (err) {
            console.log("Update failed", err);
        }
    };


    return (
        <>

            {/* HEADER */}
            <LinearGradient
                colors={["#EE5E1E", "#F27D23"]}
                style={[
                    styles.header,
                    { paddingTop: insets.top + 8 } // adjust 8 if needed
                ]}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Tables</Text>

                    <View style={styles.activeContainer}>
                        <MaterialIcons name="event-seat" size={16} color="#fff" />
                        <Text style={styles.activeText}>
                            {totalActiveTables} Active
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>

                {/* BODY */}
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#EE5E1E" />
                    </View>
                ) : (
                    <>
                        <View style={styles.sectionFilterContainer}>
                            <FlatList
                                data={sectionNames}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => {
                                    const selected = item === selectedSection;

                                    return (
                                        <View
                                            style={[
                                                styles.sectionChip,
                                                selected && styles.sectionChipActive,
                                            ]}
                                        >
                                            <Text
                                                onPress={() => setSelectedSection(item)}
                                                style={[
                                                    styles.sectionChipText,
                                                    selected && styles.sectionChipTextActive,
                                                ]}
                                            >
                                                {item}
                                            </Text>
                                        </View>
                                    );
                                }}
                            />
                        </View>

                        <FlatList
                            style={{ padding: 12 }}
                            data={sections}
                            scrollEnabled={true}
                            keyExtractor={(item) => item[0]}
                            renderItem={({ item }) => {
                                const sectionName = item[0];
                                const sectionTables = item[1];

                                return (
                                    <View style={styles.sectionContainer}>
                                        <Text style={styles.sectionTitle}>{sectionName}</Text>

                                        <FlatList
                                            scrollEnabled={false}
                                            data={sectionTables}
                                            numColumns={2}
                                            keyExtractor={(table) => table._id.toString()}
                                            renderItem={({ item }) => (
                                                <TableCard
                                                    table={item}
                                                    onPress={() =>
                                                        navigation.navigate("Orders", {
                                                            orderType: "DINE-IN",
                                                            tableId: item._id,
                                                            tableNo: item.tableNo,
                                                            sectionName: item.sectionId?.name,
                                                        })
                                                    }
                                                    onLongPress={handleTableStatusChange}   // 👈 ADD
                                                />
                                            )}
                                        />
                                    </View>
                                );
                            }}
                        />
                    </>
                )}



                <Modal visible={actionModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>

                            {/* Header */}
                            <Text style={styles.modalTitle}>
                                Table {selectedTable?.tableNo}
                            </Text>
                            <Text style={styles.modalSubtitle}>Choose Action</Text>

                            {/* Buttons */}
                            <View style={{ display: "flex", flexDirection: "row", gap: 12, justifyContent: "center" }}>

                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.greenBtn]}
                                    onPress={() => {
                                        updateStatus(selectedTable._id, "AVAILABLE");
                                        setActionModal(false);
                                    }}
                                >
                                    <Text style={styles.actionText}>Mark as Available</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.redBtn]}
                                    onPress={() => {
                                        updateStatus(selectedTable._id, "OCCUPIED");
                                        setActionModal(false);
                                    }}
                                >
                                    <Text style={styles.actionText}>Mark as Occupied</Text>
                                </TouchableOpacity>

                            </View>

                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setActionModal(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
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
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    activeBadge: {
        backgroundColor: "white",
        color: "#EE5E1E",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        fontWeight: "bold",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
    },

    sectionContainer: {
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        marginLeft: 8,
        color: "#374151",
    },
    sectionFilterContainer: {
        paddingVertical: 10,
        paddingLeft: 12,
    },

    sectionChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginRight: 8,
        backgroundColor: "#fff",
    },

    sectionChipActive: {
        backgroundColor: "#EE5E1E",
        borderColor: "#EE5E1E",
    },

    sectionChipText: {
        fontSize: 15,
        color: "#374151",
        fontWeight: "600",
    },

    sectionChipTextActive: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700"
    },
    activeContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)", // 👈 glass effect like order form
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 30,
        gap: 6,
    },

    activeText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },





    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },

    modalContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        color: "#0f172a",
    },

    modalSubtitle: {
        textAlign: "center",
        color: "#64748B",
        marginBottom: 20,
    },

    actionBtn: {
        padding: 16,
        borderRadius: 18,
        marginBottom: 12,
        alignItems: "center",
    },

    greenBtn: {
        backgroundColor: "#c6ffe5",

    },

    redBtn: {
        backgroundColor: "#ffd3d3",
    },

    actionText: {
        fontWeight: "600",
        fontSize: 15,
        color: "#111",
        fontWeight: "700",
    },

    cancelBtn: {
        marginTop: 10,
        padding: 14,
        alignItems: "center",
        backgroundColor: "#f1f7ff",
        borderRadius: 14,
    },

    cancelText: {
        color: "#272e37",
        fontWeight: "600",
        fontWeight: "700",
    },
}); 