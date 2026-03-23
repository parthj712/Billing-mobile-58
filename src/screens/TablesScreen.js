import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
    View,
    FlatList,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import LinearGradient from "react-native-linear-gradient";
import TableCard from "../compoenenets/TableCard";
import { getTables } from "../services/tableService";
import { Menu, Button } from "react-native-paper";

export default function TablesScreen({ navigation }) {

    const insets = useSafeAreaInsets();

    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedSection, setSelectedSection] = useState("All");
    const [menuVisible, setMenuVisible] = useState(false);





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
                    <Text style={styles.activeBadge}>
                        {totalActiveTables} Active
                    </Text>
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
                                                />
                                            )}
                                        />
                                    </View>
                                );
                            }}
                        />
                    </>
                )}




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

});