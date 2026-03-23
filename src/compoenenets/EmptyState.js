import React from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Text } from 'react-native-paper';

const EmptyState = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.emptyContainer}>
                <MaterialIcons
                    name="receipt-long"
                    size={90}
                    color="#CBD5E1"
                />
                <Text style={styles.emptyTitle}>
                    No Order Selected
                </Text>
                <Text style={styles.emptySubtitle}>
                    Please select a table or create a takeaway order.
                </Text>
            </View>
        </SafeAreaView>
    )
}

export default EmptyState




const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 20,
        color: "#1E293B",
    },

    emptySubtitle: {
        fontSize: 14,
        textAlign: "center",
        marginTop: 10,
        color: "#64748B",
    },
});