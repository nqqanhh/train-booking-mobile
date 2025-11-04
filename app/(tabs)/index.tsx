// app/(tabs)/index.tsx
import { Redirect, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View, SafeAreaViewBase,
  StyleSheet
} from "react-native";

import {
  getRouteIdByOriginDestination,
  getRoutes,
  getRouteByOriginDestination,
} from "@/src/services/bookingApi";
import { useAuth } from "@/src/hooks/useAuth";

// (tuỳ chọn) nếu muốn date picker native:
// expo install @react-native-community/datetimepicker
// import DateTimePicker from '@react-native-community/datetimepicker';

const theme = {
  bg: "#F6FAF6",
  card: "#FFFFFF",
  line: "#E6ECE6",
  text: "#0F172A",
  sub: "#687588",
  green: "#7AC943",
  greenDark: "#62B331",
  greenPale: "#E8F6E8",
  shadow: "#00000010",
};

export default function HomeScreen() {
  const router = useRouter();
  const [oneWay, setOneWay] = useState(true);
  const [loading, setLoading] = useState(false); // thêm state loading
  // state demo — bạn có thể nối API routes & địa điểm thật
  const [fromLoc, setFromLoc] = useState("Sài Gòn");
  const [toLoc, setToLoc] = useState("Phan Thiết");
  const [depart, setDepart] = useState<Date>(new Date());
  const [ret, setRet] = useState<Date>(new Date(Date.now() + 4 * 86400000));
  const [seats, setSeats] = useState(1);
  const [routes, setRoutes] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(true);
  const departStr = useMemo(() => formatDate(depart), [depart]);
  const returnStr = useMemo(() => formatDate(ret), [ret]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await getRoutes();
      setRoutes(res);
      console.log(routes);
    } catch (error) {
      console.log("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRoutes();
  }, []);
  const onSearch = async () => {
    const route = await getRouteByOriginDestination(fromLoc, toLoc);
    const routeId = route.id;
    if (!routeId || isNaN(Number(routeId))) {
      alert("Không tìm thấy route hợp lệ (routeId null/NaN)");
      return (
        <View>
          <Text>
            Không tìm thấy tuyến {fromLoc}
            {"->"}
            {toLoc}
          </Text>
        </View>
      );
    }
    router.push({
      pathname: "/booking/trips",
      params: {
        // // ví dụ tìm route theo origin/destination
        origin: fromLoc,
        destination: toLoc,
        routeId: String(routeId),
        date: toISO(depart),
        passengers: String(seats),
        roundtrip: String(!oneWay),
        return_date: !oneWay ? toISO(ret) : undefined,
      },
    });
  };

  const handleToggleModal = () => {
    setModalVisible((modalVisible) => (modalVisible = !modalVisible));
    console.log(modalVisible);
  };
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header “Welcome back” kiểu thẻ mờ */}
      <View
        style={{
          height: "35%",
          backgroundColor: theme.green,
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
        }}
      />
      <View style={{ marginTop: -70, paddingHorizontal: 16 }}>
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 14,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: theme.text,
              marginBottom: 8,
            }}
          >
            Where do you want to go?
          </Text>

          {/* One Way / Round Trip */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#F1F5F1",
              padding: 4,
              borderRadius: 12,
              marginBottom: 14,
            }}
          >
            <TogglePill
              active={oneWay}
              label="One Way"
              onPress={() => setOneWay(true)}
            />
            <TogglePill
              active={!oneWay}
              label="Round Trip"
              onPress={() => setOneWay(false)}
            />
          </View>

          {/* Current Location */}
          <FieldCard
            label="Current Location"
            value={fromLoc}
            onPress={() => {
              setIsSelectingOrigin(true);
              setModalVisible(true);
            }}
          />

          {/* Destination */}
          <FieldCard
            label="Destination"
            value={toLoc}
            onPress={() => {
              setIsSelectingOrigin(false);
              setModalVisible(true);
            }}
          />

          {/* Dates */}
          <View
            style={{
              flexDirection: oneWay ? "column" : "row",
              gap: 12,
              marginTop: 12,
            }}
          >
            <FieldCard
              label="Departure Date"
              value={departStr}
              style={{ flex: 1 }}
              onPress={() => {
                // Nếu đã cài DateTimePicker thì mở ở đây,
                // còn demo thì đổi +1 ngày
                setDepart(new Date(depart.getTime() + 86400000));
              }}
            />
            {!oneWay && (
              <FieldCard
                label="Return Date"
                value={returnStr}
                style={{ flex: 1 }}
                onPress={() => {
                  setRet(new Date(ret.getTime() + 86400000));
                }}
              />
            )}
          </View>

          {/* Seats stepper */}
          <View
            style={{
              marginTop: 12,
              backgroundColor: "#F7FAF7",
              borderWidth: 1,
              borderColor: theme.line,
              padding: 12,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ color: theme.sub, fontWeight: "600" }}>Seat</Text>
              <Text style={{ color: theme.text, fontWeight: 700 }}>
                {seats} {seats > 1 ? "Seats" : "Seat"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <RoundBtn
                disabled={seats <= 1}
                label="−"
                onPress={() => setSeats(Math.max(1, seats - 1))}
              />
              <Text
                style={{
                  width: 44,
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "700",
                  color: theme.text,
                }}
              >
                {seats}
              </Text>
              <RoundBtn
                label="+"
                onPress={() => setSeats(Math.min(10, seats + 1))}
              />
            </View>
          </View>

          {/* Search button */}
          <TouchableOpacity
            onPress={() => onSearch()}
            activeOpacity={0.8}
            style={{
              marginTop: 16,
              backgroundColor: theme.green,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
              shadowColor: theme.shadow,
              shadowOpacity: 0.4,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <Text
              style={{ color: "#fff", fontWeight: "800", letterSpacing: 0.3 }}
            >
              Search Train
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Gợi ý dưới (placeholder) */}
      <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
        <Text style={{ color: theme.sub, fontWeight: "700", marginBottom: 8 }}>
          Popular destinations
        </Text>

        {loading ? (
          <Text style={{ color: theme.sub }}>Loading routes...</Text>
        ) : (
          <FlatList
            horizontal
            data={routes}
            // TRẢ VỀ STRING!
            keyExtractor={(item) => String(item.id)}
            // Tạo khoảng cách giữa chips
            ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
            contentContainerStyle={{ paddingVertical: 4, paddingRight: 16 }}
            showsHorizontalScrollIndicator={false}
            style={{ height: 40 }} // đảm bảo có chiều cao để hiển thị
            ListEmptyComponent={
              <Text style={{ color: theme.sub }}>No routes</Text>
            }
            renderItem={({ item: r }) => (
              <TouchableOpacity
                onPress={() => {
                  setFromLoc(r.origin);
                  setToLoc(r.destination);
                }}
              >
                <Chip title={`${r.origin} → ${r.destination}`} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              width: "80%",
              maxHeight: "70%",
              padding: 20,
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: 16,
                color: theme.text,
                marginBottom: 10,
              }}
            >
              {isSelectingOrigin ? "Select Origin" : "Select Destination"}
            </Text>

            <ScrollView>
              {routes.map((r) => {
                const stations = isSelectingOrigin ? r.origin : r.destination;
                return (
                  <Pressable
                    key={r.id + (isSelectingOrigin ? "o" : "d")}
                    onPress={() => {
                      if (isSelectingOrigin) setFromLoc(stations);
                      else setToLoc(stations);
                      setModalVisible(false);
                    }}
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: "#eee",
                    }}
                  >
                    <Text style={{ fontSize: 15, color: theme.text }}>
                      {stations}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 10,
                backgroundColor: theme.green,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------- components nhỏ ---------- */

function TogglePill({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: active ? theme.green : "transparent",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: active ? "#fff" : theme.text,
          fontWeight: "700",
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FieldCard({
  label,
  value,
  onPress,
  style,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  style?: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          marginTop: 10,
          backgroundColor: "#F7FAF7",
          borderWidth: 1,
          borderColor: theme.line,
          padding: 12,
          borderRadius: 12,
        },
        style,
      ]}
    >
      <Text style={{ color: theme.sub, fontSize: 12, marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ color: theme.text, fontWeight: "700" }}>{value}</Text>
    </Pressable>
  );
}

function RoundBtn({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.line,
        backgroundColor: disabled ? "#F0F2F0" : theme.card,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 8,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          lineHeight: Platform.OS === "ios" ? 18 : undefined,
          fontWeight: "800",
          color: disabled ? "#9AA39A" : theme.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Chip({ title }: { title: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: theme.greenPale,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: theme.greenDark, fontWeight: "700", fontSize: 12 }}>
        {title}
      </Text>
    </View>
  );
}

/* ---------- helpers ---------- */
function formatDate(d: Date) {
  const dd = d.getDate().toString().padStart(2, "0");
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  // ví dụ “18 Oct”
  const monthShort = d.toLocaleString("en-US", { month: "short" });
  return `${dd} ${monthShort}`;
}
function toISO(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
