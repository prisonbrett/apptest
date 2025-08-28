import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import ShootingCard, { Shooting } from "../../components/ShootingCard";

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// ---- MOCK: remplace par fetch Google Calendar plus tard ----
const mock: Shooting[] = [
  {
    id: "1",
    start: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
    clientName: "Cabinet Bedin – Caudéran",
    phone: "tel:+33695224625",
    prestation: "Photo",
    address: "12 Av. du Général Leclerc, 33200 Bordeaux",
  },
  {
    id: "2",
    start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    clientName: "Foncia – Chartrons",
    phone: "tel:+33500000000",
    prestation: "VV",
    address: "15 Rue Notre-Dame, 33000 Bordeaux",
  },
  // demain
  {
    id: "3",
    start: new Date(new Date().setHours(10, 0, 0, 0) + 24 * 60 * 60 * 1000).toISOString(),
    end: new Date(new Date().setHours(11, 0, 0, 0) + 24 * 60 * 60 * 1000).toISOString(),
    clientName: "Laforêt – Mérignac",
    phone: "tel:+33500001234",
    prestation: "Drone",
    address: "3 Av. de l'Yser, 33700 Mérignac",
  },
];

export default function TodayScreen() {
  const [events, setEvents] = useState<Shooting[]>([]);
  const [expandToday, setExpandToday] = useState(false);
  const [expandTomorrow, setExpandTomorrow] = useState(false);

  useEffect(() => {
    // TODO: remplace par fetch depuis ton backend/n8n (Google Calendar)
    setEvents(mock);
  }, []);

  const now = new Date();
  const todayList = events
    .filter(e => isSameDay(new Date(e.start), now))
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));

  const tomorrowDate = new Date(now); tomorrowDate.setDate(now.getDate() + 1);
  const tomorrowList = events
    .filter(e => isSameDay(new Date(e.start), tomorrowDate))
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));

  const nextToday = useMemo(() => {
    const upcoming = todayList.filter(e => new Date(e.end) > now);
    return upcoming[0];
  }, [todayList]);

  const showTomorrow = !nextToday && todayList.length === 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.h1}>{showTomorrow ? "Demain" : "Aujourd’hui"}</Text>

        {/* Prochain shooting */}
        {!showTomorrow && nextToday ? <ShootingCard item={nextToday} /> : null}

        {/* Voir plus - AUJOURD'HUI */}
        {!showTomorrow && todayList.length > (nextToday ? 1 : 0) && (
          <>
            <TouchableOpacity onPress={() => setExpandToday(v => !v)} style={s.more}>
              <Text style={s.moreTxt}>{expandToday ? "Voir moins" : "Voir plus"}</Text>
            </TouchableOpacity>

            {expandToday && (
              <View style={s.listGap}>
                {(nextToday ? todayList.slice(1) : todayList).map(ev => (
                  <ShootingCard key={ev.id} item={ev} />
                ))}
              </View>
            )}
          </>
        )}

        {/* DEMAIN (si aujourd'hui vide) */}
        {showTomorrow && tomorrowList[0] && <ShootingCard item={tomorrowList[0]} />}

        {showTomorrow && tomorrowList.length > 1 && (
          <>
            <TouchableOpacity onPress={() => setExpandTomorrow(v => !v)} style={s.more}>
              <Text style={s.moreTxt}>{expandTomorrow ? "Voir moins" : "Voir plus"}</Text>
            </TouchableOpacity>

            {expandTomorrow && (
              <View style={s.listGap}>
                {tomorrowList.slice(1).map(ev => (
                  <ShootingCard key={ev.id} item={ev} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b0c10" },
  content: { padding: 16, gap: 12 },
  h1: { color: "#f4f7fa", fontSize: 22, fontWeight: "900", marginBottom: 8 },
  more: { paddingVertical: 8 },
  moreTxt: { color: "#97a6ff", fontSize: 14, fontWeight: "800" },
  listGap: { gap: 10 },
});