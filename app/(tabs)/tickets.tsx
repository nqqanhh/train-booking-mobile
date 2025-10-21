import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import images from "@/assets/images/index";
import { useRouter } from "expo-router";
const theme = {
  BG: "#dfdfdfff",
  CARD: "#FFFFFF",
  line: "#E6ECE6",
  text: "#0F172A",
  sub: "#687588",
  GREEN: "#7AC943",
  greenDark: "#62B331",
  greenPale: "#E8F6E8",
  shadow: "#00000010",
  classCard: "#023549ff",
};

export default function TicketScreen() {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerItems}>
          <Ionicons
            name="chevron-back"
            size={30}
            style={{ color: "white" }}
            onPress={() => handleBack()}
          />
        </View>
        <View style={styles.headerItems}>
          <Text style={[styles.textWhite, styles.headerText]}>My tickets</Text>
        </View>
      </View>
      <View style={styles.ticketListWrapper}>
        <TouchableOpacity style={styles.ticketCard}>
          <View style={styles.statusWrapper}>
            <Image source={images.trainIcon} style={styles.eTrainLogo} />
            <Text>{"{Status}"}</Text>
          </View>
          <View style={styles.ticketRoute}>
            <Text style={styles.ticketRouteText}>Sài Gòn</Text>
            <Ionicons name="arrow-forward-sharp" size={28} />

            <Text style={styles.ticketRouteText}>Hải Phòng</Text>
          </View>
          {/*  */}
          <View style={styles.ticketSubDetail}>
            <View style={styles.ticketSubDetailChild}>
              <View>
                <Text>Tuesday, 26 October</Text>
                <Text style={styles.textBold}>8:00 {"->"} 18:50</Text>
              </View>
              <View>
                <Text>Seat</Text>
                <Text style={styles.textBold}>1 seat</Text>
              </View>
            </View>
            <View style={styles.classCard}>
              <Text style={styles.classCardText}>Class</Text>{" "}
              <Ionicons
                style={styles.classCardText}
                name="information-circle-outline"
                size={10}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.BG,
    paddingHorizontal: 16,
  },
  headerWrapper: {
    backgroundColor: theme.GREEN,
    height: "10%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerItems: {
    width: "41%",
  },
  textWhite: {
    color: "#fff",
    fontWeight: "600",
  },
  headerText: {
    fontSize: 20,
  },
  ticketListWrapper: {
    padding: 16,

    height: "90%",
  },
  statusWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: "10%",
    alignItems: "center",
    padding: "5%",
  },
  ticketCard: {
    backgroundColor: theme.CARD,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: "7%",
    gap: 9,
    height: "35%",
  },
  eTrainLogo: {
    height: 40,
    width: 40,
  },
  ticketRoute: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  ticketRouteText: {
    fontSize: 24,
  },
  ticketSubDetail: { padding: 16, gap: 10 },
  ticketSubDetailChild: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textBold: {
    fontWeight: 600,
    fontSize: 17,
  },
  classCard: {
    backgroundColor: theme.classCard,

    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  classCardText: {
    color: "#fff",
    fontSize: 14,
  },
});
