import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getRoutes } from "../../src/services/bookingApi";

export default function RoutesListScreen() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const data = await getRoutes();
        setRoutes(data);
      } catch (e) {
        console.log("Error loading routes:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Đang tải tuyến đường...</Text>
      </View>
    );

  return (
    <FlatList
      data={routes}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 16,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
          onPress={() =>
            router.push({
              pathname: "/booking/trips",
              params: { routeId: item.id },
            })
          }
        >
          <Text style={{ fontSize: 16, fontWeight: "700" }}>
            {item.origin} → {item.destination}
          </Text>
          <Text style={{ color: "#666" }}>{item.distance_km} km</Text>
        </TouchableOpacity>
      )}
    />
  );
}
// app/(tabs)/index.tsx
// import React, { useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Pressable,
//   Platform,
//   ScrollView,
// } from "react-native";
// import { useRouter } from "expo-router";

// // (tuỳ chọn) nếu muốn date picker native:
// // expo install @react-native-community/datetimepicker
// // import DateTimePicker from '@react-native-community/datetimepicker';

// const theme = {
//   bg: "#F6FAF6",
//   card: "#FFFFFF",
//   line: "#E6ECE6",
//   text: "#0F172A",
//   sub: "#687588",
//   green: "#7AC943",
//   greenDark: "#62B331",
//   greenPale: "#E8F6E8",
//   shadow: "#00000010",
// };

// export default function HomeScreen() {
//   const router = useRouter();
//   const [oneWay, setOneWay] = useState(true);

//   // state demo — bạn có thể nối API routes & địa điểm thật
//   const [fromLoc, setFromLoc] = useState("");
//   const [toLoc, setToLoc] = useState("");
//   const [depart, setDepart] = useState<Date>(new Date());
//   const [ret, setRet] = useState<Date>(new Date(Date.now() + 4 * 86400000));
//   const [seats, setSeats] = useState(1);

//   const departStr = useMemo(() => formatDate(depart), [depart]);
//   const returnStr = useMemo(() => formatDate(ret), [ret]);

//   const onSearch = () => {
//     // Điều hướng tới trang chọn chuyến (bạn đã có /booking/trips)
//     // Đổi params theo backend của bạn
//     router.push({
//       pathname: "/booking/trips",
//       params: {
//         // ví dụ tìm route theo origin/destination
//         origin: fromLoc,
//         destination: toLoc,
//         date: toISO(depart),
//         passengers: String(seats),
//         roundtrip: String(!oneWay),
//         return_date: !oneWay ? toISO(ret) : undefined,
//       },
//     });
//   };

//   return (
//     <ScrollView
//       style={{ flex: 1, backgroundColor: theme.bg }}
//       contentContainerStyle={{ paddingBottom: 24 }}
//     >
//       {/* Header “Welcome back” kiểu thẻ mờ */}
//       <View
//         style={{
//           height: 110,
//           backgroundColor: theme.green,
//           borderBottomLeftRadius: 18,
//           borderBottomRightRadius: 18,
//         }}
//       />
//       <View style={{ marginTop: -70, paddingHorizontal: 16 }}>
//         <View
//           style={{
//             backgroundColor: theme.card,
//             borderRadius: 16,
//             padding: 16,
//             shadowColor: "#000",
//             shadowOpacity: 0.08,
//             shadowOffset: { width: 0, height: 6 },
//             shadowRadius: 14,
//             elevation: 2,
//           }}
//         >
//           <Text
//             style={{
//               fontSize: 18,
//               fontWeight: "700",
//               color: theme.text,
//               marginBottom: 8,
//             }}
//           >
//             Where do you want to go?
//           </Text>

//           {/* One Way / Round Trip */}
//           <View
//             style={{
//               flexDirection: "row",
//               backgroundColor: "#F1F5F1",
//               padding: 4,
//               borderRadius: 12,
//               marginBottom: 14,
//             }}
//           >
//             <TogglePill
//               active={oneWay}
//               label="One Way"
//               onPress={() => setOneWay(true)}
//             />
//             <TogglePill
//               active={!oneWay}
//               label="Round Trip"
//               onPress={() => setOneWay(false)}
//             />
//           </View>

//           {/* Current Location */}
//           <FieldCard
//             label="Current Location"
//             value={fromLoc}
//             onPress={() =>
//               // ở đây có thể mở modal chọn ga
//               setFromLoc(fromLoc === "Sài Gòn" ? "Hà Nội" : "Sài Gòn")
//             }
//           />

//           {/* Destination */}
//           <FieldCard
//             label="Destination"
//             value={toLoc}
//             onPress={() =>
//               setToLoc(toLoc === "Phan Thiết" ? "Nha Trang" : "Phan Thiết")
//             }
//           />

//           {/* Dates */}
//           <View
//             style={{
//               flexDirection: oneWay ? "column" : "row",
//               gap: 12,
//               marginTop: 12,
//             }}
//           >
//             <FieldCard
//               label="Departure Date"
//               value={departStr}
//               style={{ flex: 1 }}
//               onPress={() => {
//                 // Nếu đã cài DateTimePicker thì mở ở đây,
//                 // còn demo thì đổi +1 ngày
//                 setDepart(new Date(depart.getTime() + 86400000));
//               }}
//             />
//             {!oneWay && (
//               <FieldCard
//                 label="Return Date"
//                 value={returnStr}
//                 style={{ flex: 1 }}
//                 onPress={() => {
//                   setRet(new Date(ret.getTime() + 86400000));
//                 }}
//               />
//             )}
//           </View>

//           {/* Seats stepper */}
//           <View
//             style={{
//               marginTop: 12,
//               backgroundColor: "#F7FAF7",
//               borderWidth: 1,
//               borderColor: theme.line,
//               padding: 12,
//               borderRadius: 12,
//               flexDirection: "row",
//               alignItems: "center",
//               justifyContent: "space-between",
//             }}
//           >
//             <Text style={{ color: theme.sub, fontWeight: "600" }}>Seat</Text>
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <RoundBtn
//                 disabled={seats <= 1}
//                 label="−"
//                 onPress={() => setSeats(Math.max(1, seats - 1))}
//               />
//               <Text
//                 style={{
//                   width: 44,
//                   textAlign: "center",
//                   fontSize: 16,
//                   fontWeight: "700",
//                   color: theme.text,
//                 }}
//               >
//                 {seats} {seats > 1 ? "Seats" : "Seat"}
//               </Text>
//               <RoundBtn
//                 label="+"
//                 onPress={() => setSeats(Math.min(10, seats + 1))}
//               />
//             </View>
//           </View>

//           {/* Search button */}
//           <TouchableOpacity
//             onPress={onSearch}
//             activeOpacity={0.8}
//             style={{
//               marginTop: 16,
//               backgroundColor: theme.green,
//               paddingVertical: 14,
//               borderRadius: 12,
//               alignItems: "center",
//               shadowColor: theme.shadow,
//               shadowOpacity: 0.4,
//               shadowOffset: { width: 0, height: 6 },
//               shadowRadius: 12,
//               elevation: 2,
//             }}
//           >
//             <Text
//               style={{ color: "#fff", fontWeight: "800", letterSpacing: 0.3 }}
//             >
//               Search Train
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Gợi ý dưới (placeholder) */}
//       <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
//         <Text style={{ color: theme.sub, fontWeight: "700", marginBottom: 8 }}>
//           Popular destinations
//         </Text>
//         <View style={{ flexDirection: "row", gap: 8 }}>
//           <Chip title="Sài Gòn → Nha Trang" />
//           <Chip title="Hà Nội → Hải Phòng" />
//         </View>
//       </View>
//     </ScrollView>
//   );
// }

// /* ---------- components nhỏ ---------- */

// function TogglePill({
//   active,
//   label,
//   onPress,
// }: {
//   active: boolean;
//   label: string;
//   onPress: () => void;
// }) {
//   return (
//     <Pressable
//       onPress={onPress}
//       style={{
//         flex: 1,
//         paddingVertical: 8,
//         borderRadius: 10,
//         backgroundColor: active ? theme.green : "transparent",
//         alignItems: "center",
//       }}
//     >
//       <Text
//         style={{
//           color: active ? "#fff" : theme.text,
//           fontWeight: "700",
//           fontSize: 13,
//         }}
//       >
//         {label}
//       </Text>
//     </Pressable>
//   );
// }

// function FieldCard({
//   label,
//   value,
//   onPress,
//   style,
// }: {
//   label: string;
//   value: string;
//   onPress?: () => void;
//   style?: any;
// }) {
//   return (
//     <Pressable
//       onPress={onPress}
//       style={[
//         {
//           marginTop: 10,
//           backgroundColor: "#F7FAF7",
//           borderWidth: 1,
//           borderColor: theme.line,
//           padding: 12,
//           borderRadius: 12,
//         },
//         style,
//       ]}
//     >
//       <Text style={{ color: theme.sub, fontSize: 12, marginBottom: 4 }}>
//         {label}
//       </Text>
//       <Text style={{ color: theme.text, fontWeight: "700" }}>{value}</Text>
//     </Pressable>
//   );
// }

// function RoundBtn({
//   label,
//   onPress,
//   disabled,
// }: {
//   label: string;
//   onPress: () => void;
//   disabled?: boolean;
// }) {
//   return (
//     <Pressable
//       onPress={onPress}
//       disabled={disabled}
//       style={{
//         width: 32,
//         height: 32,
//         borderRadius: 16,
//         borderWidth: 1,
//         borderColor: theme.line,
//         backgroundColor: disabled ? "#F0F2F0" : theme.card,
//         alignItems: "center",
//         justifyContent: "center",
//         marginHorizontal: 8,
//       }}
//     >
//       <Text
//         style={{
//           fontSize: 18,
//           lineHeight: Platform.OS === "ios" ? 18 : undefined,
//           fontWeight: "800",
//           color: disabled ? "#9AA39A" : theme.text,
//         }}
//       >
//         {label}
//       </Text>
//     </Pressable>
//   );
// }

// function Chip({ title }: { title: string }) {
//   return (
//     <View
//       style={{
//         paddingHorizontal: 10,
//         paddingVertical: 8,
//         backgroundColor: theme.greenPale,
//         borderRadius: 999,
//       }}
//     >
//       <Text style={{ color: theme.greenDark, fontWeight: "700", fontSize: 12 }}>
//         {title}
//       </Text>
//     </View>
//   );
// }

// /* ---------- helpers ---------- */
// function formatDate(d: Date) {
//   const dd = d.getDate().toString().padStart(2, "0");
//   const mm = (d.getMonth() + 1).toString().padStart(2, "0");
//   const yyyy = d.getFullYear();
//   // ví dụ “18 Oct”
//   const monthShort = d.toLocaleString("en-US", { month: "short" });
//   return `${dd} ${monthShort}`;
// }
// function toISO(d: Date) {
//   const yyyy = d.getFullYear();
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const dd = String(d.getDate()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}`;
// }
