import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const greetings = [
    "Hello",
    "नमस्ते",
    "Bonjour",
    "Hola",
    "Ciao",
    "こんにちは",
    "안녕하세요",
    "مرحبا",
    "Guten Tag",
];

export default function WelcomeScreen({ route }) {
    const navigation = useNavigation();
    const { user } = route.params || {};

    const [index, setIndex] = useState(0);
    const [showLogo, setShowLogo] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;
    const progress = useRef(new Animated.Value(0)).current;


    const slideAnim = useRef(new Animated.Value(-60)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    const revealAnim = useRef(new Animated.Value(1)).current;

    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (showLogo) {
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 32,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [showLogo]);

    // Greeting animation loop
    useEffect(() => {
        const animate = () => {
            revealAnim.setValue(1);

            Animated.timing(revealAnim, {
                toValue: 0,
                duration: 1500,
                useNativeDriver: false,
            }).start(() => {
                setTimeout(() => {
                    setIndex((prev) => (prev + 1) % greetings.length);
                }, 1200); // hold time
            });
        };

        animate();
    }, [index]);

    // Initial fade in
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 900,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        const animateGreeting = () => {
            slideAnim.setValue(-60);
            opacityAnim.setValue(0);
            scaleAnim.setValue(0.95);

            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setTimeout(() => {
                    Animated.parallel([
                        Animated.timing(slideAnim, {
                            toValue: 60,
                            duration: 600,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 0,
                            duration: 600,
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        setIndex((prev) => (prev + 1) % greetings.length);
                    });
                }, 600); // hold time before exit
            });
        };

        animateGreeting();
    }, [index]);

    // Show logo after 3 sec
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLogo(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // Progress bar animation
    useEffect(() => {
        Animated.timing(progress, {
            toValue: width,
            duration: 6000,
            useNativeDriver: false,
        }).start();
    }, []);

    // Redirect
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace("Main", {
                screen: "Tables",
            });
        }, 4800);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.center}>
                {!showLogo ? (
                    <View style={{ overflow: "hidden" }}>
                        <Text style={styles.greeting}>
                            {greetings[index]}
                        </Text>

                        <Animated.View
                            style={[
                                StyleSheet.absoluteFill,
                                {
                                    backgroundColor: "#f8fafc", // same as screen bg
                                    transform: [
                                        {
                                            translateX: revealAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [width, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        />
                    </View>
                ) : (
                    <Animated.View
                        style={{
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                        }}
                    >
                        <Image
                            source={require("../../assets/Logo.png")}
                            style={{ width: 120, height: 120 }}
                            resizeMode="contain"
                        />
                    </Animated.View>
                )}
            </View>

            {/* Progress Line */}
            <Animated.View
                style={[
                    styles.progressBar,
                    {
                        width: progress,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        justifyContent: "center",
        alignItems: "center",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    greeting: {
        fontSize: 48,
        fontWeight: "500",
        color: "#000C5A",
    },
    progressBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        height: 3,
        backgroundColor: "#4f46e5",
    },
});