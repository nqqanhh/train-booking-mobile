import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/hooks/useAuth";
import images from "../../assets/images";

const BG = "#F6FAF6";
const TRAINBG = "#bbbbbb69";
const TEXT = "#0F172A";
const LINE = "#E8EEE8";
const PROFILE_CARD = "#BBBBBB";

export default function Account() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const onLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* HEADER background image cover */}
      <ImageBackground
        source={images.trainSubBg}
        resizeMode="cover"
        style={{
          height: 160, // ⬅️ đổi từ "20vh"
          paddingTop: Platform.OS === "ios" ? 8 : 12,
          paddingHorizontal: 16,
          justifyContent: "flex-end",
          width: "100%",
        }}
        imageStyle={{
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        {/* overlay để chữ rõ hơn, KHÔNG chặn touch */}
        <View
          pointerEvents="none" // ⬅️ không chặn chạm
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: TRAINBG,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        />
        <Text
          style={{
            fontWeight: "700",
            fontSize: 26,
            color: TEXT,
            marginBottom: 10,
          }}
        >
          Account
        </Text>
      </ImageBackground>

      {/* Profile card */}
      <TouchableOpacity
        onPress={() => router.push("/account/info")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: PROFILE_CARD,
          margin: 16,
          padding: 16,
          borderRadius: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../assets/images/dummy_avt.png")}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              marginRight: 16,
            }}
          />
          <View>
            <Text style={{ fontWeight: "700", color: TEXT }}>
              {user?.full_name || "Guest"}
            </Text>
            <Text style={{ fontSize: 12, color: "#555" }}>
              {user?.email || "—"}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={TEXT} />
      </TouchableOpacity>

      {/* Sections */}
      <View style={{ paddingHorizontal: 16, gap: 16 }}>
        <Text style={{ fontWeight: "700", fontSize: 14, color: TEXT }}>
          General
        </Text>

        {/* Không bọc Pressable bên ngoài nữa, để Row tự handle onPress */}
        <Row
          icon="person"
          label="Passenger Profiles"
          onPress={() => router.push("/account/passengers")}
        />

        <Row icon="lock-closed" label="Security" />
        <Row icon="ticket-outline" label="Voucher & Discount" />
        <Row icon="notifications-outline" label="Notification" />

        <Text style={{ fontWeight: "700", fontSize: 14, color: TEXT }}>
          Help
        </Text>

        <Row icon="help-circle-outline" label="Help Center" />
        <Row icon="star-outline" label="Rate Our App" />
        <Row icon="document-text-outline" label="Terms of Service" />

        <TouchableOpacity
          onPress={onLogout}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: LINE,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Ionicons name="log-out-outline" size={20} color="red" />
            <Text style={{ color: "red" }}>Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Row: tự nhận onPress, KHÔNG lồng thêm touchable bên ngoài
function Row({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: LINE,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Ionicons name={icon} size={20} color={TEXT} />
        <Text style={{ color: TEXT }}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={TEXT} />
    </Pressable>
  );
}
