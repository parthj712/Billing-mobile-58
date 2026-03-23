import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
} from "react-native";
import { getMenuItems } from "../../services/menuService";
import {
    saveOrdersToDraft,
    addTakeawayOrder,
} from "../../services/orderService";
import { useDispatch, useSelector } from "react-redux";
import { fetchMenuItems } from "../../../redux/slices/menuSlice";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Modal } from "react-native";
import { getShopInfo } from "../../services/shopService";
import { SnackbarContext } from "../../context/SnackbarContext";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { nanoid } from "nanoid/non-secure";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "react-native-calendars";

export default function OrderForm({
    tableId,
    tableNo,
    orderType,

    onViewCart,
    onAddAllSuccess,   // ✅ ADD THIS
}) {
    const searchRef = useRef(null);

    const { showSnackbar } = useContext(SnackbarContext);

    const insets = useSafeAreaInsets();

    // const [menuItems, setMenuItems] = useState([]);
    const dispatch = useDispatch();
    const { items: menuItems, loading } = useSelector(
        (state) => state.menu
    );
    const [search, setSearch] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [kotMessage, setKotMessage] = useState("");
    const [customerName, setCustomerName] = useState("");

    const [customerMobile, setcustomerMobile] = useState("");
    const [customerBirthDate, setcustomerBirthDate] = useState("");

    const [showDatePicker, setShowDatePicker] = useState(false);

    const [calendarVisible, setCalendarVisible] = useState(false);

    const [categoryModalVisible, setCategoryModalVisible] = useState(false);

    const [category, setCategory] = useState("");


    const [shopData, setShopData] = useState(null);
    const isDineIn = shopData?.businessCategory === "DINE_IN";


    const screenWidth = Dimensions.get("window").width;
    const numColumns = screenWidth > 600 ? 3 : 2;

    useEffect(() => {
        dispatch(fetchMenuItems());
    }, []);

    useEffect(() => {
        fetchShopData();
    }, []);

    const fetchMenu = async () => {
        try {
            const res = await getMenuItems();

            console.log("Menu API Response:", res);

            // 👇 IMPORTANT FIX
            setMenuItems(Array.isArray(res) ? res : res?.data || []);
        } catch (error) {
            console.log("Menu fetch error:", error.message);
        }
    };



    const filteredItems = useMemo(() => {
        const q = search.toLowerCase().trim();

        // 🔴 If nothing selected and no search → show nothing
        if (!category && !q) {
            return [];
        }

        return menuItems?.filter((i) => {
            const matchesCategory = category
                ? i.categoryName === category
                : true;

            const matchesSearch =
                q.length > 0 &&
                (i.name.toLowerCase().includes(q) ||
                    i.itemCode.toLowerCase().includes(q));

            // If category selected → ignore search
            if (category) return matchesCategory;

            // If searching → ignore category
            if (q) return matchesSearch;

            return false;
        });
    }, [menuItems, search, category]);



    const categories = useMemo(() => {
        if (!menuItems) return [];

        const uniqueCategories = new Set(
            menuItems
                .map((item) => item.categoryName)
                .filter(Boolean)
        );

        return Array.from(uniqueCategories);
    }, [menuItems]);


    // console.log("categories:", categories);

    const getItemPrice = (x) => {
        if (x.variantPrice != null) {
            return x.variantPrice;
        }

        if (x.portion === "half" && x.item.price?.half) {
            return x.item.price.half;
        }

        return x.item.price?.full || 0;
    };

    // const handleSelectItem = (item) => {
    //     setSelectedItems((prev) => {
    //         const existing = prev.find(
    //             (x) => x.item._id === item._id && x.portion === "full"
    //         );

    //         if (existing) {
    //             return prev.map((x) =>
    //                 x.id === existing.id ? { ...x, qty: x.qty + 1 } : x
    //             );
    //         }

    //         return [
    //             ...prev,
    //             {
    //                 id: Date.now().toString(),
    //                 item,
    //                 qty: 1,
    //                 portion: "full",
    //             },
    //         ];
    //     });

    //     setSearch("");
    //     searchRef.current?.focus();
    // };

    const handleSelectItem = (item) => {
        if (item.priceType === "VARIANT" && item.variants?.length) {
            const firstVariant = item.variants[0];

            setSelectedItems((prev) => {
                const existing = prev.find((x) => x.item._id === item._id);

                if (existing) {
                    return prev.map((x) =>
                        x.tempId === existing.tempId ? { ...x, qty: x.qty + 1 } : x,
                    );
                }

                return [
                    ...prev,
                    {
                        id: nanoid(),
                        item,
                        variantName: firstVariant.name,
                        variantPrice: firstVariant.price,
                        portion: null,
                        qty: 1,
                    },
                ];
            });
        }

        else if (item.priceType === "HALF_FULL") {
            setSelectedItems((prev) => {
                const existing = prev.find(
                    (x) =>
                        x.item._id === item._id &&
                        x.portion === "full"
                );

                if (existing) {
                    return prev.map((x) =>
                        x.id === existing.id ? { ...x, qty: x.qty + 1 } : x
                    );
                }

                return [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        item,
                        portion: "full",
                        variantName: null,
                        variantPrice: null,
                        qty: 1,
                    },
                ];
            });
        }

        else {
            setSelectedItems((prev) => {
                const existing = prev.find(
                    (x) => x.item._id === item._id
                );

                if (existing) {
                    return prev.map((x) =>
                        x.id === existing.id ? { ...x, qty: x.qty + 1 } : x
                    );
                }

                return [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        item,
                        portion: null,
                        variantName: null,
                        variantPrice: item.price?.full,
                        qty: 1,
                    },
                ];
            });
        }

        setSearch("");
        searchRef.current?.focus();
    };

    const updateQty = (id, qty) => {
        setSelectedItems((prev) =>
            prev.map((x) =>
                x.id === id ? { ...x, qty: Math.max(1, qty) } : x
            )
        );
    };

    const updatePortion = (id, portion) => {
        setSelectedItems((prev) =>
            prev.map((x) =>
                x.id === id ? { ...x, portion } : x
            )
        );
    };


    const updateVariant = (id, variant) => {
        setSelectedItems((prev) =>
            prev.map((x) =>
                x.id === id
                    ? {
                        ...x,
                        variantName: variant.name,
                        variantPrice: variant.price,
                    }
                    : x
            )
        );
    };

    const removeItem = (id) => {
        setSelectedItems((prev) =>
            prev.filter((x) => x.id !== id)
        );
    };

    const totalAmount = useMemo(() => {
        return selectedItems.reduce(
            (sum, x) => sum + getItemPrice(x) * x.qty,
            0
        );
    }, [selectedItems]);

    const handleAddAllToOrder = async () => {
        if (!selectedItems.length) return;

        if (orderType === "TAKEAWAY" && !customerName.trim()) {
            // Alert.alert("Customer name required");
            showSnackbar("Customer name is required", "error");
            return;
        }

        const payload = {
            orderType,
            tableId,
            tableNo,
            customer: {
                name: customerName,
                mobile: customerMobile,
                birthDate: customerBirthDate,
            },
            kotMessage,
            items: selectedItems.map((x) => ({
                menuItemId: x.item._id,
                name: x.item.name,
                category: x.item.categoryName,
                price: getItemPrice(x),
                qty: x.qty,
                portion: x.portion || null,
                variantName: x.variantName || null,
                itemCode: x.item.itemCode,
            })),
        };

        try {
            if (orderType === "TAKEAWAY") {

                console.log("payload", payload)

                await addTakeawayOrder(payload);


            } else {
                await saveOrdersToDraft(payload);
            }

            // Alert.alert("Success", "Order added successfully");
            showSnackbar("Order added successfully", "success");

            // 🔥 Refresh Cart Instantly
            if (onAddAllSuccess) {
                onAddAllSuccess();
            }

            setSelectedItems([]);
            setKotMessage("");
            setCustomerName("");

        } catch (error) {
            showSnackbar("Failed to add order", "error");
        }
    };


    const fetchShopData = async () => {
        try {
            const res = await getShopInfo();
            setShopData(res?.data?.data);
            // console.log("Shop data:", res?.data?.data); // Debugging line
        } catch (error) {
            console.log("Shop fetch error", error);
            setShopData({}); // fallback
        }
    };



    if (!shopData) return null; // prevent flicker


    return (
        <>
            <FlatList
                data={filteredItems}
                numColumns={numColumns}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                keyExtractor={(item) => item._id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ padding: 15, paddingBottom: insets.bottom + 10 }}
                ListFooterComponentStyle={{ marginBottom: 40 }}
                ListHeaderComponent={
                    <View>
                        <Text style={styles.title}>Add Order</Text>

                        {orderType === "TAKEAWAY" && (
                            <TextInput
                                placeholder="Customer Name"
                                placeholderTextColor="black"
                                value={customerName}
                                onChangeText={setCustomerName}
                                style={styles.Nameinput}
                            />
                        )}

                        {orderType === "TAKEAWAY" && shopData?.businessCategory === "BAKERY" && (
                            <View style={{ display: "flex", flexDirection: "row", gap: 4 }}>
                                <TextInput
                                    placeholder="Enter mobile number"
                                    placeholderTextColor="black"
                                    value={customerMobile}
                                    onChangeText={(text) => {
                                        if (/^\d{0,10}$/.test(text)) {
                                            setcustomerMobile(text);
                                        }
                                    }}
                                    style={styles.input}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />

                                {/* <TextInput
                                    placeholder="Birthdate"
                                    placeholderTextColor="black"
                                    value={customerBirthDate}
                                    onChangeText={setcustomerBirthDate}
                                    style={styles.input}
                                /> */}

                                <TouchableOpacity
                                    onPress={() => setCalendarVisible(true)}
                                    style={styles.input}
                                >
                                    <Text style={{ color: customerBirthDate ? "black" : "#9CA3AF" }}>
                                        {customerBirthDate || "Select Birthdate"}
                                    </Text>
                                </TouchableOpacity>

                                {/* {showDatePicker && (
                                    <DateTimePicker
                                        value={customerBirthDate ? new Date(customerBirthDate) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);

                                            if (selectedDate) {
                                                const formatted = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
                                                setcustomerBirthDate(formatted);
                                            }
                                        }}
                                    />
                                )} */}
                            </View>
                        )}

                        <View style={styles.searchRow}>
                            <TextInput
                                ref={searchRef}
                                placeholder="Search item..."
                                placeholderTextColor="black"
                                value={search}
                                onChangeText={setSearch}
                                style={styles.searchInput}
                            />

                            <TouchableOpacity
                                style={styles.categoryButton}
                                onPress={() => setCategoryModalVisible(true)}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="restaurant-menu" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        {isDineIn ? (<Text style={styles.title}>Menu Items</Text>) : (<Text style={styles.title}>Takeaway Order</Text>)}

                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.menuCard}
                        onPress={() => handleSelectItem(item)}
                    >
                        <Text style={{ fontWeight: "600", fontSize: 14, color: "black" }}>
                            {item.name}
                        </Text>
                        <View>
                            {item.priceType === "VARIANT" ? (
                                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
                                    {item.variants?.map((v, i) => (
                                        <Text key={i} style={{ fontSize: 12, marginRight: 8, color: "black" }}>
                                            {v.name} (₹{v.price})
                                        </Text>
                                    ))}
                                </View>
                            ) : item.priceType === "HALF_FULL" ? (
                                <Text style={{ fontSize: 13, color: "black" }}>
                                    {item.price?.full !== undefined && `Full ₹${item.price.full}`}
                                    {item.price?.half !== undefined && `  Half ₹${item.price.half}`}
                                </Text>
                            ) : (
                                <Text style={{ fontSize: 13, color: "black" }}>
                                    ₹ {item.price?.full ?? 0}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                )}


                ListFooterComponent={
                    <View>
                        {selectedItems.length > 0 && (
                            <>


                                <View style={styles.selectedHeader}>
                                    <Text style={styles.selectedHeaderText}>
                                        Selected Items ({selectedItems.length})
                                    </Text>
                                </View>

                                {selectedItems.map((x) => {
                                    const unitPrice = getItemPrice(x);

                                    return (
                                        <View key={x.id} style={styles.card}>

                                            {/* Top Row: Name + Portion Buttons */}
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>

                                                <Text style={{ fontWeight: "600", fontSize: 16, color: "black" }}>
                                                    {x.item.name}
                                                </Text>


                                                <Text style={{ color: "black" }}>
                                                    ₹ {unitPrice} /
                                                    {x.variantName
                                                        ? ` (${x.variantName})`
                                                        : x.portion
                                                            ? ` (${x.portion})`
                                                            : ""}
                                                </Text>


                                            </View>

                                            {/* Bottom Row: Qty + Delete */}
                                            <View style={{ flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", marginTop: 12 }}>

                                                {/* Portion Buttons */}
                                                <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start" }}>

                                                    {/* VARIANT */}
                                                    {x.item.priceType === "VARIANT" &&
                                                        x.item.variants?.map((v, i) => (
                                                            <TouchableOpacity
                                                                key={i}
                                                                onPress={() => updateVariant(x.id, v)}
                                                                style={[
                                                                    styles.portionBtn,
                                                                    x.variantName === v.name && styles.activePortion
                                                                ]}
                                                            >
                                                                <Text
                                                                    style={[
                                                                        styles.portionText,
                                                                        x.variantName === v.name && styles.activePortionText
                                                                    ]}
                                                                >
                                                                    {/* {v.name} ₹{v.price} */}
                                                                    {v.name}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        ))}

                                                    {/* HALF FULL */}
                                                    {x.item.priceType === "HALF_FULL" && (
                                                        <>
                                                            {x.item?.price?.full && (
                                                                <TouchableOpacity
                                                                    onPress={() => updatePortion(x.id, "full")}
                                                                    style={[
                                                                        styles.portionBtn,
                                                                        x.portion === "full" && styles.activePortion
                                                                    ]}
                                                                >
                                                                    <Text
                                                                        style={[
                                                                            styles.portionText,
                                                                            x.portion === "full" && styles.activePortionText
                                                                        ]}
                                                                    >
                                                                        Full ₹{x.item.price.full}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            )}

                                                            {x.item?.price?.half && (
                                                                <TouchableOpacity
                                                                    onPress={() => updatePortion(x.id, "half")}
                                                                    style={[
                                                                        styles.portionBtn,
                                                                        x.portion === "half" && styles.activePortion
                                                                    ]}
                                                                >
                                                                    <Text
                                                                        style={[
                                                                            styles.portionText,
                                                                            x.portion === "half" && styles.activePortionText
                                                                        ]}
                                                                    >
                                                                        Half ₹{x.item.price.half}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </>
                                                    )}

                                                </View>

                                                <View
                                                    style={{
                                                        width: "100%",
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                    }}
                                                >
                                                    {/* Qty */}
                                                    <View style={styles.qtyContainer}>

                                                        <TouchableOpacity
                                                            style={styles.qtyButton}
                                                            onPress={() => updateQty(x.id, x.qty - 1)}
                                                            activeOpacity={0.7}
                                                        >
                                                            <MaterialIcons name="remove" size={18} color="#334155" />
                                                        </TouchableOpacity>

                                                        <View style={styles.qtyBadge}>
                                                            <Text style={styles.qtyText}>{x.qty}</Text>
                                                        </View>

                                                        <TouchableOpacity
                                                            style={[styles.qtyButton, styles.qtyPlus]}
                                                            onPress={() => updateQty(x.id, x.qty + 1)}
                                                            activeOpacity={0.7}
                                                        >
                                                            <MaterialIcons name="add" size={18} color="#fff" />
                                                        </TouchableOpacity>

                                                    </View>

                                                    <TouchableOpacity
                                                        onPress={() => removeItem(x.id)}
                                                        style={styles.deleteBtn}
                                                    >
                                                        <MaterialIcons name="delete-outline" size={20} color="#dc2626" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}

                                <TextInput
                                    placeholder="KOT Message"
                                    placeholderTextColor="black"
                                    value={kotMessage}
                                    onChangeText={setKotMessage}
                                    style={styles.Nameinput}
                                />

                                <View style={styles.totalBox}>
                                    <Text style={styles.totalText}>
                                        {`Total ₹ ${totalAmount}`}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleAddAllToOrder}
                                >
                                    <Text style={{ color: "#fff" }}>
                                        Add All To Order
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                }
            />



            <Modal
                visible={categoryModalVisible}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Select Category</Text>

                        {/* ALL */}
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                !category && styles.activeCategoryChip,
                            ]}
                            onPress={() => {
                                setCategory("");
                                setCategoryModalVisible(false);
                            }}
                        >
                            <Text
                                style={[
                                    styles.categoryChipText,
                                    !category && styles.activeCategoryText,
                                ]}
                            >
                                All
                            </Text>
                        </TouchableOpacity>

                        {/* Dynamic Categories */}
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryChip,
                                    category === cat && styles.activeCategoryChip,
                                ]}
                                onPress={() => {
                                    setCategory(cat);
                                    setCategoryModalVisible(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.categoryChipText,
                                        category === cat && styles.activeCategoryText,
                                    ]}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            onPress={() => setCategoryModalVisible(false)}
                            style={{ marginTop: 20 }}
                        >
                            <Text style={{ color: "#F97316", fontWeight: "bold", textAlign: "right" }}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            <Modal
                visible={calendarVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.calendarOverlay}>
                    <View style={styles.calendarContainer}>

                        <Text style={styles.calendarTitle}>Select Birthdate</Text>

                        <Calendar
                            onDayPress={(day) => {
                                setcustomerBirthDate(day.dateString);
                                setCalendarVisible(false);
                            }}
                            markedDates={{
                                [customerBirthDate]: {
                                    selected: true,
                                    selectedColor: "#F97316",
                                },
                            }}
                            theme={{
                                todayTextColor: "#F97316",
                                arrowColor: "#F97316",
                                selectedDayBackgroundColor: "#F97316",
                            }}
                        />

                        <TouchableOpacity
                            onPress={() => setCalendarVisible(false)}
                            style={styles.closeBtn}
                        >
                            <Text style={{ color: "#fff" }}>Close</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "black" },

    Nameinput: {
        backgroundColor: "#fff",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 10,
        color: "black"
    },
    input: {
        backgroundColor: "#fff",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 10,
        width: "50%",
        maxWidth: "100%",
        color: "black"
    },
    inputBirthday: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 10,
        width: "100%"
    },
    menuCard: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        // margin: 6,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        color: "black"
    },
    card: {
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 10,
        borderColor: "#E2E8F0",
        borderWidth: 1,
    },
    row: {
        flexDirection: "row",
        gap: 15,
        alignItems: "center",
        marginTop: 10,
    },
    btn: { fontSize: 20 },
    qty: { fontSize: 16, fontWeight: "bold" },
    totalBox: {
        backgroundColor: "#E2E8F0",
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        textAlign: "center",
    },
    totalText: { fontSize: 18, fontWeight: "bold", textAlign: "center" , color : "black"},
    button: {
        backgroundColor: "#1E293B",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 15,
    },
    portionBtn: {
        backgroundColor: "#E5E7EB",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,   // ✅ add spacing here
    },

    activePortion: {
        backgroundColor: "#334155",
    },

    portionText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#374151",
    },

    activePortionText: {
        color: "#fff",
    },

    deleteBtn: {
        backgroundColor: "#fee2e2",
        padding: 6,
        borderRadius: 20,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },

    searchInput: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    categoryButton: {
        marginLeft: 10,
        backgroundColor: "#F97316",
        padding: 12,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#F97316",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
    },

    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "black"
    },

    categoryChip: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: "#F1F5F9",
        marginBottom: 10,
    },

    activeCategoryChip: {
        backgroundColor: "#F97316",
    },

    categoryChipText: {
        fontWeight: "600",
        color: "#1E293B",
    },

    activeCategoryText: {
        color: "#fff",
    },
    selectedHeader: {
        backgroundColor: "#F1F5F9",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0"
    },

    selectedHeaderText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B"
    },
    qtyContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        borderRadius: 30,
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginVertical: 10
    },

    qtyButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#E2E8F0",
        justifyContent: "center",
        alignItems: "center",
    },

    qtyPlus: {
        backgroundColor: "#334155",
    },

    qtyBadge: {
        minWidth: 36,
        alignItems: "center",
        justifyContent: "center",
    },

    qtyText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
    },
    calendarOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    calendarContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        width: "90%",
    },

    calendarTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "black",
    },

    closeBtn: {
        marginTop: 15,
        backgroundColor: "#1E293B",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },
});