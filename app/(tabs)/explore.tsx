// app/(tabs)/explore.tsx (ví dụ)
import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView, View, Text, FlatList, Image, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, StyleSheet
} from "react-native";
import { useRouter } from "expo-router";
import { fetchTrainArticles, TrainArticle } from "@/src/services/newsApi";

export default function Explore() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [list, setList] = useState<TrainArticle[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (opts?: { reset?: boolean; fresh?: boolean }) => {
    if (loading || loadingMore) return;
    const nextPage = opts?.reset ? 1 : page;
    opts?.reset ? setLoading(true) : setLoadingMore(true);
    try {
      const res = await fetchTrainArticles({
        q: q.trim() || undefined,
        page: nextPage,
        pageSize,
        fresh: opts?.fresh ? 1 : 0,
      });
      setTotal(res.total);
      setList(prev => (opts?.reset ? res.items : [...prev, ...res.items]));
      setPage(nextPage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [q, page, pageSize, loading, loadingMore]);

  // first load
  useEffect(() => { load({ reset: true }); }, []);

  const onSearch = () => load({ reset: true, fresh: true });

  const onRefresh = async () => {
    setRefreshing(true);
    try { await load({ reset: true, fresh: true }); }
    finally { setRefreshing(false); }
  };

  const onEndReached = () => {
    const canLoadMore = (page * pageSize) < total;
    if (canLoadMore) setPage(p => p + 1);
  };

  // auto fetch when page increases (load more)
  useEffect(() => {
    if (page > 1) load();
  }, [page]);

  const renderItem = ({ item }: { item: TrainArticle }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: "/news/[id]", params: { id: item.id } })}
    >
      <View style={styles.thumb}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <View style={styles.thumbFallback}><Text>IMG</Text></View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text numberOfLines={3}>{item.summary}</Text>
        <Text style={styles.meta}>
          {item.source} • {item.published_at ? new Date(item.published_at).toLocaleString() : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Search bar */}
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

      {loading && list.length === 0 ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReachedThreshold={0.3}
          onEndReached={onEndReached}
          ListFooterComponent={
            loadingMore ? <View style={{ paddingVertical: 12 }}><ActivityIndicator /></View> : null
          }
          ListEmptyComponent={<View style={styles.center}><Text>Không có bài phù hợp.</Text></View>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: "row", gap: 8, padding: 12 },
  input: { flex: 1, height: 44, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12 },
  btn: { height: 44, paddingHorizontal: 16, backgroundColor: "#3ac21f", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 12, flexDirection: "row", gap: 12,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  thumb: { width: 110, height: 80, borderRadius: 8, overflow: "hidden", backgroundColor: "#f2f2f2" },
  thumbFallback: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "#eee" },
  title: { fontWeight: "700" },
  meta: { marginTop: 6, color: "#687588", fontSize: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
