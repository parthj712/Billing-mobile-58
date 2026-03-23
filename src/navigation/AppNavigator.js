import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import BottomTabs from "./BottomTabs";
import WelcomeScreen from "../compoenenets/WelcomeScreen";
import PrinterSetupScreen from "../screens/PrinterSetupScreen";
import AddMenuScreen from "../screens/AddMenuScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null;

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <>
                        <Stack.Screen name="Welcome" component={WelcomeScreen} />
                        <Stack.Screen name="Main" component={BottomTabs} />
                        <Stack.Screen name="PrinterSetup" component={PrinterSetupScreen} />
                        <Stack.Screen name="MenuScreen" component={AddMenuScreen} />
                        {/* <Stack.Screen name="Billing" component={BillingScreen} /> */}
                        {/* <Stack.Screen name="PrinterSettings" component={PrinterSettingsScreen} /> */}
                    </>
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}