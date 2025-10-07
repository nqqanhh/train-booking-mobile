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
