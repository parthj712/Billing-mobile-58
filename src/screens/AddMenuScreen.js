import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { addMenuItem, getCatgories } from "../services/menuService";
import { SnackbarContext } from "../context/SnackbarContext";
// import { addMenuItem, getCatgories } from "../services/menuService";

const FOOD_TYPES = ["Veg", "Non-Veg"];

export default function AddMenuScreen() {


    const { showSnackbar } = useContext(SnackbarContext);

    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        subCategory: "",
        foodType: "",
        priceType: "HALF_FULL",
        priceHalf: "",
        priceFull: "",
        itemCode: "",
        variants: [],
    });

    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    const [customCategory, setCustomCategory] = useState("");
    const [customSubCategory, setCustomSubCategory] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    /* ---------------- LOAD CATEGORIES ---------------- */

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await getCatgories();
            setCategories(res.data);
        } catch (err) {
            console.log("Category fetch error", err);
        }
    };

    /* ---------------- INPUT CHANGE ---------------- */

    const handleChange = (key, value) => {
        setForm(prev => ({
            ...prev,
            [key]: value
        }));
    };

    /* ---------------- CATEGORY CHANGE ---------------- */

    const handleCategoryChange = (value) => {

        setForm(prev => ({
            ...prev,
            category: value,
            subCategory: ""
        }));

        // if OTHER selected
        if (value === "Other") {
            setSubCategories([]);
            return;
        }

        const selected = categories.find(c => c.name === value);

        if (selected) {
            setSubCategories(selected.subCategories || []);
        } else {
            setSubCategories([]);
        }
    };

    /* ---------------- VARIANTS ---------------- */

    const addVariant = () => {
        setForm(prev => ({
            ...prev,
            variants: [...prev.variants, { name: "", price: "" }]
        }));
    };

    const removeVariant = (index) => {
        const updated = form.variants.filter((_, i) => i !== index);
        setForm({ ...form, variants: updated });
    };

    const updateVariant = (index, key, value) => {
        const updated = [...form.variants];
        updated[index][key] = value;
        setForm({ ...form, variants: updated });
    };

    /* ---------------- VALIDATION ---------------- */

    const validate = () => {

        if (!form.name.trim()) {
            showSnackbar("Item name required", "error");
            // Alert.alert("Validation", "Item name required");
            return false;
        }

        if (!form.itemCode.trim()) {
            showSnackbar("Item code required", "error");
            // Alert.alert("Validation", "Item code required");
            return false;
        }

        if (!form.category) {
            showSnackbar("Select category", "error");
            // Alert.alert("Validation", "Select category");
            return false;
        }

        if (!form.foodType) {
            showSnackbar("Select food type", "error");
            // Alert.alert("Validation", "Select food type");
            return false;
        }

        return true;
    };

    /* ---------------- SUBMIT ---------------- */

    const handleSubmit = async () => {

        if (!validate()) return;

        try {

            setLoading(true);

            const payload = {
                name: form.name.trim(),
                description: form.description?.trim(),
                itemCode: form.itemCode.trim(),

                categoryName:
                    form.category === "Other"
                        ? customCategory.trim()
                        : form.category,

                subCategory:
                    form.subCategory === "Other"
                        ? customSubCategory.trim()
                        : form.subCategory,

                foodType: form.foodType,
                priceType: form.priceType,
            };

            if (form.priceType === "SINGLE") {
                payload.priceFull = Number(form.priceFull);
            }

            if (form.priceType === "HALF_FULL") {
                payload.priceFull = Number(form.priceFull);
                payload.priceHalf = form.priceHalf
                    ? Number(form.priceHalf)
                    : 0;
            }

            if (form.priceType === "VARIANT") {

                payload.variants = form.variants
                    .filter(v => v.name?.trim() && v.price !== "")
                    .map(v => ({
                        name: v.name.trim(),
                        price: Number(v.price)
                    }));

            }

            console.log("FINAL PAYLOAD", payload);

            await addMenuItem(payload);

            // ✅ Success snackbar
            showSnackbar(`${form.name} added successfully`, "success");

            // Reset form
            setForm({
                name: "",
                description: "",
                category: "",
                subCategory: "",
                foodType: "",
                priceType: "HALF_FULL",
                priceHalf: "",
                priceFull: "",
                itemCode: "",
                variants: [],
            });

            setCustomCategory("");
            setCustomSubCategory("");
            setSubCategories([]);

        } catch (err) {

            console.log("Add menu error", err.response?.data);
            showSnackbar(
                err?.response?.data?.message || "Failed to add menu item",
                "error"
            );
            // Alert.alert("Error", "Failed to add menu item");

        } finally {

            setLoading(false);

        }
    };

    /* ---------------- UI ---------------- */

    return (
        <ScrollView style={styles.container}>



            <TextInput
                style={styles.input}
                placeholder="Item Name"
                value={form.name}
                onChangeText={(v) => handleChange("name", v)}
            />

            <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Description"
                multiline
                value={form.description}
                onChangeText={(v) => handleChange("description", v)}
            />

            <TextInput
                style={styles.input}
                placeholder="Item Code"
                value={form.itemCode}
                onChangeText={(v) => handleChange("itemCode", v)}
            />

            {/* CATEGORY */}

            <Text style={styles.label}>Category</Text>

            <View style={styles.gridContainer}>

                {categories.map((cat) => (

                    <TouchableOpacity
                        key={cat._id}
                        style={[
                            styles.gridButton,
                            form.category === cat.name && styles.gridActive
                        ]}
                        onPress={() => handleCategoryChange(cat.name)}
                    >
                        <Text
                            style={[
                                styles.gridText,
                                form.category === cat.name && styles.gridActiveText
                            ]}
                        >
                            {cat.name}
                        </Text>
                    </TouchableOpacity>

                ))}

                <TouchableOpacity
                    style={[
                        styles.gridButton,
                        form.category === "Other" && styles.gridActive
                    ]}
                    onPress={() => handleCategoryChange("Other")}
                >
                    <Text
                        style={[
                            styles.gridText,
                            form.category === "Other" && styles.gridActiveText
                        ]}
                    >
                        + Other
                    </Text>
                </TouchableOpacity>

            </View>


            {form.category === "Other" && (
                <View style={{ marginTop: 10 }}>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter new category"
                        value={customCategory}
                        onChangeText={setCustomCategory}
                    />

                    <TouchableOpacity
                        style={styles.addVariantBtn}
                        onPress={() => {

                            if (!customCategory.trim()) {
                                showSnackbar("Enter category name", "error");
                                return;
                            }

                            const newCategory = {
                                _id: Date.now().toString(),
                                name: customCategory,
                                subCategories: []
                            };

                            setCategories(prev => [...prev, newCategory]);

                            handleCategoryChange(customCategory);

                            setCustomCategory("");
                        }}
                    >
                        <Text style={styles.addVariantText}>
                            Add Category
                        </Text>
                    </TouchableOpacity>

                </View>
            )}

            {/* SUB CATEGORY */}

            <Text style={styles.label}>Sub Category</Text>

            <View style={styles.gridContainer}>

                {subCategories.map((sub) => (

                    <TouchableOpacity
                        key={sub}
                        style={[
                            styles.gridButton,
                            form.subCategory === sub && styles.gridActive
                        ]}
                        onPress={() => handleChange("subCategory", sub)}
                    >
                        <Text
                            style={[
                                styles.gridText,
                                form.subCategory === sub && styles.gridActiveText
                            ]}
                        >
                            {sub}
                        </Text>
                    </TouchableOpacity>

                ))}

                <TouchableOpacity
                    style={[
                        styles.gridButton,
                        form.subCategory === "Other" && styles.gridActive
                    ]}
                    onPress={() => handleChange("subCategory", "Other")}
                >
                    <Text
                        style={[
                            styles.gridText,
                            form.subCategory === "Other" && styles.gridActiveText
                        ]}
                    >
                        + Other
                    </Text>
                </TouchableOpacity>

            </View>


            {(form.subCategory === "Other" || form.category === "Other") && (
                <View style={{ marginTop: 10 }}>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter new sub category"
                        value={customSubCategory}
                        onChangeText={setCustomSubCategory}
                    />

                    <TouchableOpacity
                        style={styles.addVariantBtn}
                        onPress={() => {

                            if (!customSubCategory.trim()) {
                                showSnackbar("Enter sub category name", "error");
                                return;
                            }

                            // add to list
                            setSubCategories(prev => [...prev, customSubCategory]);

                            // select it automatically
                            handleChange("subCategory", customSubCategory);

                            // clear input
                            setCustomSubCategory("");
                        }}
                    >
                        <Text style={styles.addVariantText}>
                            Add Sub Category
                        </Text>
                    </TouchableOpacity>

                </View>
            )}

            {/* FOOD TYPE */}

            <Text style={styles.label}>Food Type</Text>

            <View style={styles.foodRow}>

                {/* Veg */}
                <TouchableOpacity
                    style={[
                        styles.foodBtn,
                        form.foodType === "Veg" && styles.foodActive
                    ]}
                    onPress={() => handleChange("foodType", "Veg")}
                >
                    <View style={styles.vegIconOuter}>
                        <View style={styles.vegIconInner} />
                    </View>

                    <Text style={styles.foodText}>Veg</Text>
                </TouchableOpacity>


                {/* Non Veg */}
                <TouchableOpacity
                    style={[
                        styles.foodBtn,
                        form.foodType === "Non-Veg" && styles.foodActive
                    ]}
                    onPress={() => handleChange("foodType", "Non-Veg")}
                >
                    <View style={styles.nonVegIconOuter}>
                        <View style={styles.nonVegIconInner} />
                    </View>

                    <Text style={styles.foodText}>Non Veg</Text>
                </TouchableOpacity>

            </View>

            {/* PRICE TYPE */}

            <Text style={styles.label}>Price Type</Text>

            <Picker
                selectedValue={form.priceType}
                onValueChange={(v) => handleChange("priceType", v)}
            >
                <Picker.Item label="Single Price" value="SINGLE" />
                <Picker.Item label="Half / Full" value="HALF_FULL" />
                <Picker.Item label="Variants" value="VARIANT" />
            </Picker>

            {/* HALF FULL */}

            {form.priceType === "HALF_FULL" && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Half Price"
                        keyboardType="numeric"
                        value={form.priceHalf}
                        onChangeText={(v) => handleChange("priceHalf", v)}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Full Price"
                        keyboardType="numeric"
                        value={form.priceFull}
                        onChangeText={(v) => handleChange("priceFull", v)}
                    />
                </>
            )}

            {/* SINGLE */}

            {form.priceType === "SINGLE" && (
                <View style={styles.priceInputWrapper}>
                    <Text style={styles.rupee}>₹</Text>

                    <TextInput
                        style={styles.priceInput}
                        placeholder="Price"
                        keyboardType="numeric"
                        value={form.priceFull}
                        onChangeText={(v) => handleChange("priceFull", v)}
                    />
                </View>
            )}

            {/* VARIANTS */}

            {form.priceType === "VARIANT" && (
                <View style={{ marginTop: 10 }}>

                    {form.variants.map((v, i) => (

                        <View key={i} style={styles.variantCard}>

                            <TextInput
                                style={styles.variantName}
                                placeholder="Variant name (Small / Large)"
                                value={v.name}
                                onChangeText={(text) =>
                                    updateVariant(i, "name", text)
                                }
                            />

                            <View style={styles.variantRight}>

                                <Text style={styles.rupee}>₹</Text>

                                <TextInput
                                    style={styles.variantPrice}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={v.price}
                                    onChangeText={(text) =>
                                        updateVariant(i, "price", text)
                                    }
                                />

                                <TouchableOpacity
                                    style={styles.deleteTouch}
                                    onPress={() => removeVariant(i)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.variantDelete}>✕</Text>
                                </TouchableOpacity>

                            </View>

                        </View>

                    ))}

                    {/* Add Variant Button */}

                    <TouchableOpacity
                        style={styles.addVariantBtn}
                        onPress={addVariant}
                    >
                        <Text style={styles.addVariantText}>
                            + Add Variant
                        </Text>
                    </TouchableOpacity>

                </View>
            )}

            <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.btnText}>
                    {loading ? "Adding..." : "Add Item"}
                </Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 10,
    },

    success: {
        textAlign: "center",
        color: "green",
        marginBottom: 10,
    },

    input: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#ddd",
    },

    label: {
        fontWeight: "600",
        marginTop: 10,
    },

    submitBtn: {
        backgroundColor: "#1E293B",
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 40,
    },

    btnText: {
        color: "white",
        fontWeight: "700",
    },

    variantRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },

    deleteBtn: {
        backgroundColor: "red",
        padding: 10,
        borderRadius: 6,
    },

    addBtn: {
        backgroundColor: "#2563eb",
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: "center",
    },
    foodRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },

    foodBtn: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 10,
        backgroundColor: "#fff",
    },

    foodActive: {
        borderColor: "#EE5E1E",
        backgroundColor: "#fff7ed",
    },

    foodText: {
        marginLeft: 8,
        fontWeight: "600",
    },

    vegIconOuter: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderColor: "green",
        alignItems: "center",
        justifyContent: "center",
    },

    vegIconInner: {
        width: 10,
        height: 10,
        backgroundColor: "green",
    },

    nonVegIconOuter: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderColor: "red",
        alignItems: "center",
        justifyContent: "center",
    },

    nonVegIconInner: {
        width: 10,
        height: 10,
        backgroundColor: "red",
    },
    priceInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        backgroundColor: "#fff",
        marginBottom: 12,
        paddingHorizontal: 12,
    },

    rupee: {
        fontSize: 18,
        fontWeight: "600",
        marginRight: 6,
        color: "#334155",
    },

    priceInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    variantCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginBottom: 10,
    },

    variantName: {
        flex: 1,
        fontSize: 15,
    },

    variantRight: {
        flexDirection: "row",
        alignItems: "center",
    },

    variantPrice: {
        width: 70,
        textAlign: "right",
        fontSize: 16,
    },

    variantDelete: {
        fontSize: 18,
        color: "#ef4444",
        marginLeft: 10,
    },

    addVariantBtn: {
        backgroundColor: "#f1f5f9",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },

    addVariantText: {
        fontWeight: "600",
        color: "#334155",
    },
    categoryChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginRight: 10,
        backgroundColor: "#fff",
    },

    categoryActive: {
        backgroundColor: "#EE5E1E",
        borderColor: "#EE5E1E",
    },

    categoryText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#334155",
    },

    categoryTextActive: {
        color: "#fff",
    },
    subChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginRight: 10,
        backgroundColor: "#fff",
    },

    subActive: {
        backgroundColor: "#0ea5e9",
        borderColor: "#0ea5e9",
    },

    subText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#334155",
    },

    subTextActive: {
        color: "#fff",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 10,
    },

    gridButton: {
        width: "30%",
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },

    gridActive: {
        backgroundColor: "#EE5E1E",
        borderColor: "#EE5E1E",
        color: "white"
    },

    gridText: {
        fontWeight: "600",
        color: "#334155",
    },
    gridActiveText: {
        color: "#fff",
    },
    deleteTouch: {
        padding: 10,
        marginLeft: 6,
        justifyContent: "center",
        alignItems: "baseline",
    },
});