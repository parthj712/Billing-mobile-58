import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

export default function TableCard({ table, onPress, onLongPress }) {
  const isOccupied = table.status === "OCCUPIED";

  const getRunningTime = () => {
    if (!table.occupiedAt) return "";

    const start = new Date(table.occupiedAt);
    const now = new Date();
    const diff = now - start;
    const mins = Math.floor(diff / 60000);

    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)} hr ${mins % 60} min`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isOccupied ? styles.occupied : styles.available,
      ]}
      onPress={onPress}
      onLongPress={() => onLongPress(table)}   // 👈 ADD THIS
    >
      <Text style={styles.tableNo}> Table No.{table.tableNo}</Text>

      <View
        style={[
          styles.statusBadge,
          isOccupied ? styles.badgeRed : styles.badgeGreen,
        ]}
      >
        <Text style={styles.statusText}>{table.status}</Text>
      </View>

      {isOccupied && (
        <Text style={styles.timeText}>
          {getRunningTime()}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: "flex-start",
    justifyContent: "center",
    elevation: 1,
  },
  available: {
    backgroundColor: "#e6fffa",

  },
  occupied: {
    backgroundColor: "#ffe6e6",

  },
  tableNo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black"
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeGreen: {
    backgroundColor: "#bbf7d0",
  },
  badgeRed: {
    backgroundColor: "#ffbaba",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "black"
  },
  timeText: {
    marginTop: 6,
    fontSize: 12,
    color: "#b91c1c",
    fontWeight: "bold",
  },
});