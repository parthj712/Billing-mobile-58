import React, { useState, useContext } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    ImageBackground
} from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen() {
    const { login } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        userName: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const validate = () => {
        if (!formData.userName) {
            alert("Enter valid username");
            return false;
        }

        // if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        //     alert("Enter valid 10-digit phone number");
        //     return false;
        // }

        if (formData.password.length < 6) {
            alert("Minimum 6 characters required");
            return false;
        }

        return true;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            await login(formData.userName, formData.password);
        } catch (error) {
            alert(
                error?.response?.data?.message || "Invalid username, Password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require("../../assets/login-bg-1.jpg")} // 🔥 your food image here
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.spacer}>
                            <View style={styles.card}>
                                <View style={{ alignItems: "flex-start" }}>
                                    <Text style={styles.logo}>Bill Please</Text>
                                    <Text style={styles.title}>Service Console</Text>
                                    <Text style={styles.subtitle}>
                                        Manage orders efficiently
                                    </Text>
                                </View>

                                <TextInput
                                    placeholder="Username"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.userName}
                                    onChangeText={(value) =>
                                        handleChange("userName", value)
                                    }
                                    style={styles.input}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />

                                {/* <TextInput
                                    placeholder="Phone Number"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.phone}
                                    onChangeText={(value) =>
                                        handleChange("phone", value)
                                    }
                                    style={styles.input}
                                    keyboardType="numeric"
                                    maxLength={10}
                                /> */}

                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry
                                    value={formData.password}
                                    onChangeText={(value) =>
                                        handleChange("password", value)
                                    }
                                    style={styles.input}
                                />

                                <TouchableOpacity
                                    style={[styles.button, loading && { opacity: 0.7 }]}
                                    onPress={handleLogin}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>
                                            Login to Dashboard
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },

    // Softer overlay (not dark)
    overlay: {
        flex: 1,
        // backgroundColor: "rgba(255,255,255,0.4)",
    },

    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
        marginTop: 40,
    },

    // TRUE light glass card
    card: {
        // backgroundColor: "rgba(255,255,255,0.85)",
        backgroundColor: "rgba(255,255,255,0.9)",
        padding: 25,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.6)",

        // // Soft shadow (important for light mode)
        // shadowColor: "#000",
        // shadowOpacity: 0.1,
        // shadowRadius: 15,
        // shadowOffset: { width: 0, height: 2 },
        // elevation: 2,
    },

    spacer: {
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
    },

    logo: {
        fontSize: 22,
        color: "#1e293b",
        fontWeight: "800",
    },

    title: {
        fontSize: 20,
        color: "#1e293b",
        fontWeight: "600",
        marginTop: 2,
    },

    subtitle: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 25,
        marginTop: 4,
    },

    input: {
        backgroundColor: "#ffffff",
        padding: 15,
        borderRadius: 14,
        marginBottom: 15,
        color: "#0f172a",
        fontWeight: "500",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },

    button: {
        backgroundColor: "#f59e0b",
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 10,

        shadowColor: "#f59e0b",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
    },

    buttonText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 16,
    },
});