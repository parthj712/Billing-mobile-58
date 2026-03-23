import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { verifyForgotOtp } from "./authService";


export default function VerifyOtpScreen({ route, navigation }) {
    const { email } = route.params;
    const [otp, setOtp] = useState("");

    const handleVerify = async () => {
        try {
            await verifyForgotOtp(email, otp);
            alert("OTP Verified");
            navigation.navigate("ResetPassword", { email });
        } catch (error) {
            alert("Invalid OTP");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify OTP</Text>

            <TextInput
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={handleVerify}>
                <Text style={{ color: "#fff" }}>Verify</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20 },
    title: { fontSize: 22, marginBottom: 20 },
    input: { borderWidth: 1, padding: 12, marginBottom: 15, borderRadius: 8 },
    button: {
        backgroundColor: "#16A34A",
        padding: 15,
        alignItems: "center",
        borderRadius: 8,
    },
});