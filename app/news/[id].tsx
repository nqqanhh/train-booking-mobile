// app/news/[id].tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { fetchTrainArticleDetail } from "@/src/services/newsApi";

export default function NewsDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const d = await fetchTrainArticleDetail(id);
      // cách 1: mở link gốc (ổn định nhất)
      setUrl(d.link);
      // cách 2: render HTML scrape: setHtml(d.content_html) + WebView source={{ html: ... }}
    })();
  }, [id]);

  if (!url)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  return <WebView source={{ uri: url }} />;
}
