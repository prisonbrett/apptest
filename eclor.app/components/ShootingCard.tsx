import React from "react";
import { View, Text, TouchableOpacity, Linking, StyleSheet } from "react-native";

export type Shooting = {
  id: string;
  start: string;   // ISO
  end: string;     // ISO
  clientName: string;
  phone?: string;  // ex: tel:+33695224625
  prestation?: string; // "Photo" | "Drone" | "VV"...
  address?: string;
};

const t = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function ShootingCard({ item }: { item: Shooting }) {
  const time = `${t(item.start)}–${t(item.end)}`;

  const openWaze = async () => {
    if (!item.address) return;
    try {
      await Linking.openURL(`waze://?q=${encodeURIComponent(item.address)}&navigate=yes`);
    } catch {
      Linking.openURL(`https://www.waze.com/ul?q=${encodeURIComponent(item.address)}&navigate=yes`);
    }
  };

  return (
    <View style={s.card}>
      <View style={s.top}>
        <Text style={s.time}>{time}</Text>
        {item.prestation ? <Text style={s.chip}>{item.prestation}</Text> : null}
      </View>

      <Text style={s.title}>{item.clientName}</Text>

      <View style={s.row}>
        {item.phone ? (
          <TouchableOpacity style={s.btn} onPress={() => Linking.openURL(item.phone!)}>
            <Text style={s.btnTxt}>Appeler</Text>
          </TouchableOpacity>
        ) : null}
        {item.address ? (
          <TouchableOpacity style={s.btn} onPress={openWaze}>
            <Text style={s.btnTxt}>Waze</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#151922",
    borderRadius: 18,
    padding: 14,
    gap: 6,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  time: { color: "#b6c2cf", fontSize: 13, fontWeight: "700" },
  chip: {
    color: "#a8ffb6", backgroundColor: "rgba(168,255,182,0.14)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: "hidden", fontSize: 12, fontWeight: "800",
  },
  title: { color: "#ecf2f8", fontSize: 16, fontWeight: "900", marginTop: 2 },
  row: { flexDirection: "row", gap: 8, marginTop: 8 },
  btn: { backgroundColor: "#202835", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  btnTxt: { color: "#cfe1ff", fontSize: 13, fontWeight: "800" },
});