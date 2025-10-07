import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Seat = {
  seat_code: string;
  status?: "available" | "sold" | "blocked";
  order_item_id?: number;
};
type Layout = {
  rows: number;
  cols: number;
  blocks?: Array<{ r1: number; c1: number; r2: number; c2: number }>;
};

export default function SeatGrid({
  layout,
  seats,
  selected,
  onToggle,
}: {
  layout: Layout;
  seats: Seat[];
  selected: string[];
  onToggle: (code: string) => void;
}) {
  const seatMap = useMemo(() => {
    const m = new Map<string, Seat>();
    seats.forEach((s) => m.set(s.seat_code, s));
    return m;
  }, [seats]);

  const isBlocked = (r: number, c: number) =>
    layout.blocks?.some(
      (b) => r >= b.r1 && r <= b.r2 && c >= b.c1 && c <= b.c2
    );

  const rows = [];
  for (let r = 1; r <= layout.rows; r++) {
    const cols = [];
    for (let c = 1; c <= layout.cols; c++) {
      const code = `${r}${String.fromCharCode(64 + c)}`; // 1A, 1B...
      if (isBlocked(r, c)) {
        cols.push(<View key={c} style={[styles.cell, styles.blank]} />);
        continue;
      }
      const s = seatMap.get(code);
      const sold = s?.status === "sold" || !!s?.order_item_id;
      const isSel = selected.includes(code);
      cols.push(
        <TouchableOpacity
          key={c}
          style={[
            styles.cell,
            sold ? styles.sold : styles.available,
            isSel && styles.selected,
          ]}
          disabled={sold}
          onPress={() => onToggle(code)}
        >
          <Text style={styles.cellText}>{code}</Text>
        </TouchableOpacity>
      );
    }
    rows.push(
      <View key={r} style={styles.row}>
        {cols}
      </View>
    );
  }
  return <View style={styles.wrap}></View>;
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: "row", gap: 8, justifyContent: "center" },
  cell: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: { fontSize: 12, fontWeight: "600" },
  available: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  sold: { backgroundColor: "#FFEBEE", borderWidth: 1, borderColor: "#EF9A9A" },
  selected: { borderColor: "#1976D2", borderWidth: 2 },
  blank: { backgroundColor: "transparent" },
});
