import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import {
  getMyRequests,
  SupportRequest,
} from "@/src/services/supportRequestApi";
import { useRouter } from "expo-router";
import { theme } from "@/assets/colors";
export default function SupportRequestScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMyRequests();
      setItems(res);
    } catch (e: any) {
      console.log("Error fetching passengers: ", e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await getMyRequests();
      setItems(res.myReq ?? []);
    } catch (e: any) {
      console.log("Error refreshing passengers: ", e?.message);
    } finally {
      setRefreshing(false);
    }
  };
  const handleGoBack = () => {
    router.replace("/(tabs)/profile");
  };
  const renderItem = ({ item }: { item: SupportRequest }) => (
    <View style={item.status === "unread" ? styles.item : styles.responsedItem}>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      {item.closed_at && (
        <Text style={styles.closedAt}>Closed at: {item.closed_at}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.exitIcon} onPress={handleGoBack}>
        <Ionicons name="chevron-back" size={40} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>My Support Requests</Text>
      {loading ? (
        <ActivityIndicator size="large" color={theme.green} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No support requests found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 70,
    backgroundColor: "#fff",
  },
  exitIcon: {
    position: "absolute",
    top: 60,
    left: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  item: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  responsedItem: {
    backgroundColor: theme.greenPale,
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  subject: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    color: "#666",
  },
  closedAt: {
    fontSize: 14,
    color: "#999",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 50,
  },
});
