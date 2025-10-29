import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import {
  fetchAllTrainArticles,
  TrainArticle,
} from "@/src/services/trainNewsApi";

const PAGE_SIZE = 20;

export default function ExploreClientPaging() {
  const [q, setQ] = useState("");
  const [all, setAll] = useState<TrainArticle[]>([]);
  const [visible, setVisible] = useState<TrainArticle[]>([]);
  const [cursor, setCursor] = useState(0); // số item đã show
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const mountSlice = useCallback(
    (reset = false) => {
      setVisible((prev) => {
        const start = reset ? 0 : prev.length;
        const end = Math.min(start + PAGE_SIZE, all.length);
        return reset ? all.slice(0, end) : [...prev, ...all.slice(start, end)];
      });
      setCursor((v) => Math.min((reset ? 0 : v) + PAGE_SIZE, all.length));
    },
    [all]
  );

  const loadAll = useCallback(
    async (fresh = false) => {
      setLoading(true);
      try {
        const res = await fetchAllTrainArticles({
          q: q.trim() || undefined,
          fresh: fresh ? 1 : 0,
        });
        setAll(res.items || []);
        setVisible([]); // reset trước
        setCursor(0);
        // mount trang đầu
        setTimeout(() => mountSlice(true), 0);
      } finally {
        setLoading(false);
      }
    },
    [q, mountSlice]
  );

  useEffect(() => {
    loadAll();
  }, []); // first load

  const onSearch = () => loadAll(true);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAll(true);
    } finally {
      setRefreshing(false);
    }
  };

  const onEndReached = () => {
    if (loading || loadingMore) return;
    if (cursor >= all.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      mountSlice(false);
      setLoadingMore(false);
    }, 0);
  };

  const renderItem = ({ item }: { item: TrainArticle }) => (
    <View style={styles.card}>
      <View style={styles.thumb}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <View style={styles.thumbFallback}>
            <Text>IMG</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text numberOfLines={3}>{item.summary}</Text>
        <Text style={styles.meta}>
          {item.source} •{" "}
          {item.published_at
            ? new Date(item.published_at).toLocaleString()
            : ""}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Tìm: tàu hỏa, đường sắt, ga…"
          value={q}
          onChangeText={setQ}
          onSubmitEditing={onSearch}
          style={styles.input}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.btn} onPress={onSearch}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {loading && visible.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReachedThreshold={0.3}
          onEndReached={onEndReached}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 12 }}>
                <ActivityIndicator />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text>Không có bài.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: "row", gap: 8, padding: 12 },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  btn: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: "#3ac21f",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  thumb: {
    width: 110,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
  },
  thumbFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontWeight: "700" },
  meta: { marginTop: 6, color: "#687588", fontSize: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
