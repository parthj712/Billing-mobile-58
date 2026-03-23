import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import OrderCart from "../compoenenets/order/OrderCart";
import OrderForm from "../compoenenets/order/OrderForm";
import EmptyState from "../compoenenets/EmptyState";
import LinearGradient from "react-native-linear-gradient";

const TopTab = createMaterialTopTabNavigator();

export default function WaiterMenuScreen({ route, navigation }) {
    const { tableId, tableNo, orderType, sectionName } = route.params || {};




    const insets = useSafeAreaInsets();

    const isDineIn = orderType === "DINE-IN";
    const isTakeaway = orderType === "TAKEAWAY";

    // If no params passed from navigation
    const noOrderSelected = !tableId && !isTakeaway;
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [refreshCart, setRefreshCart] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);


    const [category, setCategory] = useState("");
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);

    const tabRef = useRef(null);

    const triggerCartRefresh = () => {
        setRefreshCart(prev => !prev);
    };

    const handleItemAdded = () => {
        triggerCartRefresh();

        // ✅ Auto switch to Cart tab (only mobile)
        if (!isTablet && tabRef.current) {
            tabRef.current?.jumpTo("Cart");
        }
    };

    const updateCartMeta = (count, total) => {
        setCartCount(count);
        setCartTotal(total);
    };


    if (noOrderSelected) {
        return <EmptyState />;
    }

    return (

        <>

            <LinearGradient
                colors={["#E65100", "#F57C00"]}
                style={[
                    styles.header,
                    { paddingTop: insets.top + 8 } // adjust 8 if needed
                ]}
            >
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>

                    {orderType === "DINE-IN" ? (
                        <>
                            <View style={styles.sectionBadge}>
                                <Text style={styles.badgeText}>{sectionName}</Text>
                            </View>

                            <View style={styles.sectionBadge}>
                                <Text style={styles.badgeText}>Table {tableNo}</Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.sectionBadge}>
                            <Text style={styles.badgeText}>Takeaway Order</Text>
                        </View>
                    )}

                </View>
            </LinearGradient>

            <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>


                {isTablet ? (
                    /* ================= TABLET LAYOUT ================= */
                    <View style={styles.tabletContainer}>
                        <View style={styles.menuSection}>
                            <OrderForm
                                category={category}
                                tableId={tableId}
                                tableNo={tableNo}
                                orderType={orderType}
                                onAddAllSuccess={handleItemAdded}
                            />
                        </View>

                        <View style={styles.cartSection}>
                            <OrderCart
                                tableId={tableId}
                                tableNo={tableNo}
                                orderType={orderType}
                                refreshTrigger={refreshCart}
                                onCartUpdate={updateCartMeta}
                            />
                        </View>
                    </View>
                ) : (
                    /* ================= MOBILE LAYOUT ================= */
                    <TopTab.Navigator
                        ref={tabRef}
                        screenOptions={{
                            tabBarIndicatorStyle: { backgroundColor: "#EE5E1E" },
                            tabBarLabelStyle: { fontWeight: "bold" },
                        }}
                    >
                        <TopTab.Screen name="Menu">
                            {() => (
                                <OrderForm
                                    tableId={tableId}
                                    tableNo={tableNo}
                                    orderType={orderType}
                                    onAddAllSuccess={handleItemAdded}
                                />
                            )}
                        </TopTab.Screen>

                        <TopTab.Screen
                            name="Cart"
                            options={{
                                tabBarLabel: () => (
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={{ fontWeight: "bold" ,color :"black" }}>
                                            Cart ({cartCount})
                                        </Text>
                                        <Text style={{ fontSize: 12, color: "green" ,fontWeight: "bold" }}>
                                            ₹{cartTotal}
                                        </Text>
                                    </View>
                                ),
                            }}
                        >
                            {() => (
                                <OrderCart
                                    tableId={tableId}
                                    tableNo={tableNo}
                                    orderType={orderType}
                                    refreshTrigger={refreshCart}
                                    onCartUpdate={updateCartMeta}
                                />
                            )}
                        </TopTab.Screen>
                    </TopTab.Navigator>
                )}
            </SafeAreaView >
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: 15,
        backgroundColor: "#EE5E1E",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
    },
    tabletContainer: {
        flex: 1,
        flexDirection: "row",
    },
    menuSection: {
        flex: 2,
        borderRightWidth: 1,
        borderColor: "#ddd",
    },
    cartSection: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    headerCenter: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center"
    },

    sectionBadge: {
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 40
    },

    tableBadge: {
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20
    },

    badgeText: {
        fontWeight: "bold",
        color :"black"
    }
});