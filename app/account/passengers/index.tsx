import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  createPassengerProfile,
  getPassengerProfiles,
  updatePassengerProfile,
} from "@/src/services/userApi";
import { useRouter, useFocusEffect } from "expo-router";
import CreatePassengerModal, {
  Passenger as PassengerPayload,
} from "./components/CreatePassengerModal";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PassengerScreen() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<null | {
    id: number;
    data: PassengerPayload;
  }>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const fetchPassengers = async () => {
    setLoading(true);
    try {
      const res = await getPassengerProfiles();
      setRows(res);
    } catch (e: any) {
      console.log("Error fetching passengers: ", e?.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await getPassengerProfiles();
      setRows(res ?? []);
    } catch (e: any) {
      console.log("Error refreshing passengers: ", e?.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  // Nếu muốn tự reload khi quay lại màn hình:
  useFocusEffect(
    useCallback(() => {
      // fetchPassengers();
      return () => {};
    }, [])
  );

  const handleGoBack = () => {
    router.replace("/(tabs)/profile");
  };

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (item: any) => {
    if (!item) {
      console.warn("openEdit called with falsy item:", item);
      return;
    }
    // log xem item có id và data không
    console.log("openEdit item:", item);
    setEditing({
      id: item.id,
      data: {
        fullName: item.full_name ?? "",
        id_no: item.id_no ?? "",
        dob: item.dob ?? "",
        phone: item.phone ?? "",
      },
    });
    // console.log("editing: " + JSON.stringify(editing));
    setOpen(true);
  };
  const handleSubmit = async (payload: PassengerPayload) => {
    try {
      setSubmitting(true);
      if (editing) {
        await updatePassengerProfile(
          {
            fullName: payload.fullName,
            id_no: payload.id_no,
            dob: payload.dob,
            phone: payload.phone,
          },
          editing.id
        );
      } else {
        await createPassengerProfile({
          fullName: payload.fullName ?? "",
          id_no: payload.id_no ?? "",
          dob: payload.dob ?? "",
          phone: payload.phone ?? "",
        });
      }
      await refresh(); // reload list
      setOpen(false);
    } catch (e) {
      console.log("submit modal error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  // const goToDetail = (id: number) => {
  //   if (id == null) {
  //     console.warn("Missing id:", id);
  //     return;
  //   }
  //   router.push({
  //     pathname: "/account/passengers/[passengerId]",
  //     params: { passengerId: String(id) },
  //   });
  // };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <Pressable onPress={handleGoBack} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} />
        </Pressable>
        <View style={styles.headerTextWrapper}>
          <Text style={styles.headerText}>Passenger Profiles</Text>
        </View>
        {/* giữ chỗ cho cân đối */}
        <View style={{ width: 32 }} />
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <Pressable
            onPress={openCreate}
            style={{
              backgroundColor: "#3ac21f",
              padding: 12,
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              + New passenger
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Loading toàn trang */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, idx) => String(item?.id ?? idx)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          ListEmptyComponent={
            !loading ? (
              <Text style={{ textAlign: "center", marginTop: 24 }}>
                Bạn chưa có profile nào cả
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.profileCard}
              onPress={() => openEdit(item)}
            >
              <View>
                {/* <Text>id: {item.id}</Text> */}
                <Text style={styles.profileCardFullName}>
                  Tên: {item.full_name}
                </Text>
                <Text>SDT: {item.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} />
            </TouchableOpacity>
          )}
        />
      )}

      {editing ? (
        <CreatePassengerModal
          visible={open}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
          isEditing={true}
          title={"Edit passenger"}
          passenger={editing?.data ?? null}
        />
      ) : (
        <CreatePassengerModal
          visible={open}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
          isEditing={false}
          title={"Create passenger"}
          passenger={null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // tránh dùng "15%" cho padding; để 0 và tạo header riêng
    backgroundColor: "#fff",
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E6E6E6",
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrapper: { flex: 1, alignItems: "center" },
  headerText: { fontSize: 20, fontWeight: "600" as const },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  separator: {
    height: 8,
  },
  profileCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#000",
  },
  profileCardFullName: {
    fontWeight: "600",
  },
  emptyText: { textAlign: "center", marginTop: 24 },
  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },
});
