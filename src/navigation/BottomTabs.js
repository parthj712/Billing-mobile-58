import React, { useState } from "react";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { View, StyleSheet } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import TablesScreen from "../screens/TablesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import BillingScreen from "../screens/BillingScreen";

import WaiterMenuScreen from "../screens/WaiterMenuScreen";

import { getShopInfo } from "../services/shopService";
import { useEffect } from "react";

// import PrinterSettingsScreen from "../screens/PrinterSettingsScreen";
import { ActivityIndicator } from "react-native";
import AddMenuScreen from "../screens/AddMenuScreen";

// const Tab = createBottomTabNavigator();
const Tab = createMaterialTopTabNavigator();

export default function BottomTabs() {

    const [shopData, setShopData] = useState(null);
    // const isDineIn = shopData?.businessCategory === "DINE_IN";
    const showTables =
        shopData?.businessCategory === "DINE_IN" ||
        shopData?.businessCategory === "RESTO_BAR";


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


    if (!shopData) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <MaterialIcons name="restaurant" size={40} color="#EE5E1E" />
            </View>
        );
    }

    return (
        <Tab.Navigator
            initialRouteName={showTables ? "Tables" : "Home"}
            tabBarPosition="bottom"
            screenOptions={({ route }) => ({
                swipeEnabled: false,          // disable accidental swipe (recommended for POS)
                animationEnabled: true,       // enable smooth slide animation

                tabBarShowIcon: true,
                tabBarShowLabel: true,

                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.label,
                tabBarActiveTintColor: "#EE5E1E",
                tabBarInactiveTintColor: "#94A3B8",

                tabBarIcon: ({ focused, color }) => {
                    let iconName;

                    if (route.name === "Home") iconName = "home";
                    if (route.name === "Tables") iconName = "table-restaurant";
                    if (route.name === "Orders") iconName = "receipt";
                    if (route.name === "Bills") iconName = "description";
                    if (route.name === "Profile") iconName = "person";
                    // if (route.name === "Menu") iconName = "menu";

                    return (
                        <MaterialIcons
                            name={iconName || "circle"}
                            size={25}
                            color={color}
                        />
                    );
                },

                tabBarIndicatorStyle: {
                    height: 0, // remove top indicator line
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            {showTables && (
                <Tab.Screen name="Tables" component={TablesScreen} />
            )}
            <Tab.Screen name="Orders" component={WaiterMenuScreen} />
            <Tab.Screen name="Bills" component={BillingScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
            {/* <Tab.Screen name="Menu" component={AddMenuScreen} /> */}
            {/* <Tab.Screen name="Printer" component={PrinterSetupScreen} /> */}
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        // position: "absolute",
        height: 70,
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: -3 },
        shadowRadius: 10,
    },
    label: {
        fontSize: 11,
        fontWeight: "600",
    },
});