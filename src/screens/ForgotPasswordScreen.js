import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import {
    forgetPassword,
    verifyForgotOtp,
    resetPassword,
} from "../services/authService";

export default function ForgotPasswordScreen({ navigation }) {
    const [step, setStep] = useState("email"); // email | otp | reset
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!email) return alert("Enter email");

        try {
            setLoading(true);
            await forgetPassword({ email });
            alert("OTP Sent 📩");
            setStep("otp");
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return alert("Enter OTP");

        try {
            setLoading(true);
            await verifyForgotOtp(email, otp);
            alert("OTP Verified ✅");
            setStep("reset");
        } catch (err) {
            alert(err?.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword.length < 6)
            return alert("Minimum 6 characters required");

        try {
            setLoading(true);
            await resetPassword(email, newPassword);
            alert("Password Reset Successful 🎉");
            navigation.goBack();
        } catch (err) {
            alert(err?.response?.data?.message || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>

            {step === "email" && (
                <>
                    <TextInput
                        placeholder="Registered Email"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                    />
                    <Button
                        label={loading ? "Sending..." : "Send OTP"}
                        onPress={handleSendOtp}
                    />
                </>
            )}

            {step === "otp" && (
                <>
                    <TextInput
                        placeholder="Enter OTP"
                        value={otp}
                        onChangeText={setOtp}
                        style={styles.input}
                    />
                    <Button
                        label={loading ? "Verifying..." : "Verify OTP"}
                        onPress={handleVerifyOtp}
                    />
                </>
            )}

            {step === "reset" && (
                <>
                    <TextInput
                        placeholder="New Password"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                        style={styles.input}
                    />
                    <Button
                        label={loading ? "Updating..." : "Reset Password"}
                        onPress={handleResetPassword}
                    />
                </>
            )}

            {loading && <ActivityIndicator style={{ marginTop: 15 }} />}
        </View>
    );
}

const Button = ({ label, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 25,
        backgroundColor: "#F8FAFC",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 25,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        padding: 14,
        marginBottom: 15,
        borderRadius: 10,
        backgroundColor: "#fff",
    },
    button: {
        backgroundColor: "#2563EB",
        padding: 15,
        alignItems: "center",
        borderRadius: 10,
    },
});