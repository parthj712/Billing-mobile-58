import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { resetPassword } from "./authService";


export default function ResetPasswordScreen({ route, navigation }) {
    const { email } = route.params;
    const [password, setPassword] = useState("");

    const handleReset = async () => {
        try {
            await resetPassword(email, password);
            alert("Password Reset Successful");
            navigation.navigate("Login");
        } catch (error) {
            alert("Reset Failed");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>

            <TextInput
                placeholder="New Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={handleReset}>
                <Text style={{ color: "#fff" }}>Reset Password</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20 },
    title: { fontSize: 22, marginBottom: 20 },
    input: { borderWidth: 1, padding: 12, marginBottom: 15, borderRadius: 8 },
    button: {
        backgroundColor: "#DC2626",
        padding: 15,
        alignItems: "center",
        borderRadius: 8,
    },
});