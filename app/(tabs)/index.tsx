// import { useRouter } from "expo-router";
// import {
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// import { useState } from "react";
// export default function HomeScreen() {
//   const [tripType, setTripType] = useState<"oneWay" | "roundWay">("oneWay");

//   const router = useRouter();

//   const handleSwitchTripType = (type: "oneWay" | "roundWay") => {
//     setTripType(type);
//     // router.push(`/${type}-modal`);
//   };

//   return (
//     <View style={styles.container}>
//       {/* Chọn loại chuyến đi */}
//       <View style={styles.tabRow}>
//         <TouchableOpacity
//           style={[styles.tab, tripType === "oneWay" && styles.activeTab]}
//           onPress={() => handleSwitchTripType("oneWay")}
//         >
//           <Text style={styles.tabText}>One Way</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.tab, tripType === "roundWay" && styles.activeTab]}
//           onPress={() => handleSwitchTripType("roundWay")}
//         >
//           <Text style={styles.tabText}>Round Trip</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Form */}
//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Current Location"
//           placeholderTextColor={"#999"}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Destination"
//           placeholderTextColor={"#999"}
//         />
//         <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
//           <TextInput
//             style={[styles.input, { width: "48%" }]}
//             placeholder="Departure Date"
//             placeholderTextColor={"#999"}
//           />

//           {tripType === "roundWay" && (
//             <TextInput
//               style={styles.input}
//               placeholder="Return Date"
//               placeholderTextColor={"#999"}
//             />
//           )}
//         </View>
//         <TextInput
//           style={styles.input}
//           placeholder="Seats"
//           keyboardType="numeric"
//           placeholderTextColor={"#999"}
//         />

//         <TouchableOpacity style={styles.button}>
//           <Text style={{ color: "#fff" }}>Search Train</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "flex-start",

//     paddingHorizontal: 20,
//     paddingVertical: 70,
//     backgroundColor: "#fff",
//   },
//   tabRow: { flexDirection: "row", marginBottom: 20 },
//   tab: {
//     flex: 1,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     alignItems: "center",
//     borderRadius: 8,
//   },
//   activeTab: { backgroundColor: "#aef0b1" },
//   tabText: { fontWeight: "600" },
//   form: {},
//   input: {
//     height: 50,
//     borderColor: "#ccc",
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: "#58c451",
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//   },
// });
import Login from "../auth/login";

export default Login;
