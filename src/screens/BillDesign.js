import React from "react";
import { View, Text } from "react-native";

export const BillDesign = ({ items, total }) => {
    return (
        <View style={{ width: 384, padding: 10, backgroundColor: "#fff" }}>
            <Text style={{ fontSize: 22, textAlign: "center" }}>
                🧾 Hotel Billing
            </Text>

            {items.map((item, index) => (
                <View key={index} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 18 }}>
                        {item.name} x{item.qty}
                    </Text>
                    <Text style={{ fontSize: 18 }}>
                        ₹{item.price * item.qty}
                    </Text>
                </View>
            ))}

            <Text style={{ fontSize: 20, marginTop: 10 }}>
                Total: ₹{total}
            </Text>
        </View>
    );
};