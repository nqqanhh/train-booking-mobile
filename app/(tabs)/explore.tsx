import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/assets/colors";
import { useRouter } from "expo-router";
import React from "react";
import images from "@/assets/images";
import { Screen } from "react-native-screens";

const feed = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  image: images.trainIcon,
  title: `title ${i + 1}`,
  content:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate deleniti adipisci corporis asperiores necessitatibus nulla autem doloremque. Tempora impedit exercitationem neque provident consectetur eaque itaque culpa, autem magni laborum est?",
}));
export default function Explore() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <Text style={styles.headerText}>Explore</Text>
      </View>
      {/* <View style={styles.feedWrapper}> */}
      <FlatList
        data={feed}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={styles.feedWrapper}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={styles.feedItemCard}
              onPress={() => console.log(item)}
            >
              {/* <Image/> */}
              <View style={styles.feedItemImage}>
                {/* <Text>Image</Text> */}
                <Image
                  source={item.image}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
              <View style={styles.feedItemText}>
                <Text style={styles.feedItemTextTitle}>{item.title}</Text>
                <Text>{item.content}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      {/* </View> */}
      {/* </ScrollView> */}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  headerWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: "10%",
    backgroundColor: theme.green,
    paddingHorizontal: 16,
  },
  headerText: {
    color: theme.textWhite,
    fontWeight: "bold",
    fontSize: 20,
  },
  feedWrapper: {
    padding: 12,
    gap: 6,
  },
  feedItemCard: {
    backgroundColor: theme.card,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  feedItemImage: {
    width: "28%",
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: theme.shadow,
  },
  feedItemText: {
    width: "70%",
    height: "100%",
  },
  feedItemTextTitle: {
    fontWeight: "bold",
  },
});
