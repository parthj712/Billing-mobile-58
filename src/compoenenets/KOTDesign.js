// KOTDesign.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const KOTDesign = ({ tableNo, items, shopName, orderType }) => {

    const formatTime = () => {
        const d = new Date();
        return d.toLocaleString("en-IN");
    };

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 22, textAlign: "center", color: "black" }}>
                KOT
            </Text>

            <Text style={styles.divider}>
                ------------------------------------------------------------------------------------------------
            </Text>

            <Text style={{ fontSize: 22, textAlign: "center", color: "black" }}>
                {shopName}
            </Text>

            <Text style={styles.divider}>
                ------------------------------------------------------------------------------------------------
            </Text>

            <Text style={styles.leftText}>OrderType :{orderType}</Text>
            <Text style={{ fontSize: 20, color: "black" }}>Table: {tableNo}</Text>
            <Text style={styles.leftText}>
                Date & Time: {formatTime()}
            </Text>


            <Text style={styles.divider}>
                ------------------------------------------------------------------------------------------------
            </Text>


            {items.map((item, i) => (
                <Text key={i} style={{ fontSize: 24, color: "black" }}>
                    {item.name} x {item.qty}
                </Text>
            ))}


            <Text style={styles.divider}>
                ------------------------------------------------------------------------------------------------
            </Text>

            <Text style={styles.divider}>
                ---------------------- Kitchen Copy ----------------------
            </Text>
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        width: 384,
        backgroundColor: "#fff",
    },
    divider: {
        textAlign: "center",
        marginVertical: 5,
        color: "black",
    },

    leftText: {
        fontSize: 20,
        color: "black",
    },
})