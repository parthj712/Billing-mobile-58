import React from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    FlatList,
} from "react-native";

export default function CategoryModal({
    visible,
    onClose,
    selected,
    onSelect,
}) {
    // 🔥 Replace with Redux or API categories later
    const categories = [
        "Starter",
        "Main Course",
        "Chinese",
        "South Indian",
        "Beverages",
    ];

    const renderCategory = ({ item }) => {
        const isActive = selected === item;

        return (
            <TouchableOpacity
                style={[
                    styles.chip,
                    isActive && styles.activeChip,
                ]}
                onPress={() => onSelect(item)}
            >
                <Text
                    style={[
                        styles.chipText,
                        isActive && styles.activeText,
                    ]}
                >
                    {item}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>

                    <Text style={styles.title}>
                        Select Category
                    </Text>

                    {/* ALL Option */}
                    <TouchableOpacity
                        style={[
                            styles.chip,
                            selected === "" && styles.activeChip,
                        ]}
                        onPress={() => onSelect("")}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                selected === "" && styles.activeText,
                            ]}
                        >
                            All
                        </Text>
                    </TouchableOpacity>

                    <FlatList
                        data={categories}
                        keyExtractor={(item) => item}
                        renderItem={renderCategory}
                        contentContainerStyle={{
                            paddingVertical: 10,
                        }}
                    />

                    <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={onClose}
                    >
                        <Text style={{ color: "#fff" }}>
                            Close
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },

    modalContainer: {
        backgroundColor: "#fff",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "70%",
    },

    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },

    chip: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 10,
    },

    activeChip: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },

    chipText: {
        fontSize: 14,
        color: "#333",
    },

    activeText: {
        color: "#fff",
        fontWeight: "600",
    },

    closeBtn: {
        marginTop: 15,
        backgroundColor: "#1E293B",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },
});