import { RootState } from "@/redux/store";
import { useRouter } from "expo-router";

import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { useSelector } from "react-redux";

export default function TicketListScreen() {
  const tickets = useSelector((s: RootState) => s.tickets.list);
  const router = useRouter();

  const renderTicket = ({
    item,
  }: {
    item: {
      id: string;
      passenger: string;
      phone: string;
      seats: string;
      trip: string;
      createdAt: string;
    };
  }) => (
    <TouchableOpacity
      onPress={() => router.push(`/tickets/${item.id}`)}
      style={{
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
      }}
    >
      <Text style={{ fontWeight: "bold" }}>{item.trip}</Text>
      <Text>Ghế: {item.seats}</Text>
      <Text>Hành khách: {item.passenger}</Text>
    </TouchableOpacity>
  );
  return (
    <View>
      <Text>Vé của tôi</Text>
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(ticket) => ticket.id}
      />
    </View>
  );
}
