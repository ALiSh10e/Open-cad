import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const contourIntervals = [0.5, 1, 2, 5, 10, 20, 50];

export default function AnalysisScreen() {
  const colors = useColors();
  const [figureGround, setFigureGround] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [showTrees, setShowTrees] = useState(false);
  const [showRail, setShowRail] = useState(false);
  const [interval, setInterval] = useState(1);
  const [message, setMessage] = useState("محرك التحليل جاهز محليًا");

  function run(label: string) {
    setMessage(`${label} · تم وضع العملية في قائمة محلية قابلة للاستئناف`);
  }

  return (
    <ScreenContainer className="p-4" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: colors.primary }]}>ANALYSIS / 03</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Figure-Ground</Text>
        <Text style={[styles.description, { color: colors.muted }]}>إخراج معماري أحادي اللون من طبقات المشروع، مع إبقاء Raw وProcessed منفصلتين.</Text>

        <View style={[styles.previewCard, { backgroundColor: "#10131B", borderColor: colors.border }]}>
          <View style={styles.previewTop}><Text style={styles.previewLabel}>ARCHITECTURAL / MONOCHROME</Text><View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LOCAL</Text></View></View>
          <View style={styles.figureCanvas}>
            <Text style={styles.emptyCanvasTitle}>NO DATASET LOADED</Text>
            <Text style={styles.emptyCanvasMeta}>Import open vector data to render Figure-Ground locally</Text>
            {figureGround && <View style={styles.figureBoundary} />}
          </View>
          <View style={styles.previewFooter}><Text style={styles.previewFooterText}>SITE_BOUNDARY</Text><Text style={styles.previewFooterText}>1 : 2,500</Text><Text style={styles.previewFooterText}>EPSG:4326</Text></View>
        </View>

        <View style={styles.controlSection}><Text style={[styles.controlTitle, { color: colors.foreground }]}>طبقات Figure-Ground</Text>
          {([["Figure / Ground", figureGround, setFigureGround], ["Roads", showRoads, setShowRoads], ["Water", showWater, setShowWater], ["Rail", showRail, setShowRail], ["Trees", showTrees, setShowTrees]] as const).map(([label, value, setter]) => <View key={label} style={[styles.controlRow, { borderBottomColor: colors.border }]}><Text style={[styles.controlLabel, { color: colors.foreground }]}>{label}</Text><Switch value={value} onValueChange={setter} trackColor={{ false: "#303747", true: "#5D60D6" }} thumbColor="#FFF" /></View>)}
        </View>

        <View style={styles.twoCol}><Pressable onPress={() => run("تصدير SVG أحادي اللون")} style={({ pressed }) => [styles.outlineButton, { borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.outlineText, { color: colors.foreground }]}>تصدير SVG</Text></Pressable><Pressable onPress={() => run("إنشاء PNG عالي الدقة")} style={({ pressed }) => [styles.outlineButton, { borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.outlineText, { color: colors.foreground }]}>إنشاء PNG</Text></Pressable></View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.cardHeader}><View><Text style={[styles.cardKicker, { color: colors.primary }]}>TERRAIN / DEM</Text><Text style={[styles.cardTitle, { color: colors.foreground }]}>Hillshade · Slope · Aspect</Text></View><Text style={[styles.unavailable, { color: colors.warning }]}>IMPORT REQUIRED</Text></View><Text style={[styles.cardDescription, { color: colors.muted }]}>استورد GeoTIFF أو XYZ محليًا لإنتاج المشتقات دون إرسال الملف خارج الجهاز.</Text><View style={styles.intervalRow}>{contourIntervals.map((value) => <Pressable key={value} onPress={() => setInterval(value)} style={[styles.interval, { backgroundColor: interval === value ? colors.primary : "transparent", borderColor: interval === value ? colors.primary : colors.border }]}><Text style={{ color: interval === value ? "#FFF" : colors.muted, fontSize: 10, fontWeight: "700" }}>{value}m</Text></Pressable>)}</View><Pressable onPress={() => run(`Contours ${interval}m`)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>تشغيل تحليل محلي</Text></Pressable></View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.cardKicker, { color: colors.primary }]}>REFERENCE SYSTEM</Text><Text style={[styles.cardTitle, { color: colors.foreground }]}>CRS & Measurements</Text><View style={styles.crsRow}><View><Text style={[styles.crsValue, { color: colors.foreground }]}>WGS 84 / UTM zone 38N</Text><Text style={[styles.cardDescription, { color: colors.muted }]}>EPSG:32638 · metric calculations</Text></View><Text style={styles.check}>✓</Text></View><View style={styles.measureRow}><Text style={[styles.measureItem, { color: colors.muted }]}>DISTANCE  —  ready</Text><Text style={[styles.measureItem, { color: colors.muted }]}>ELEVATION  —  DEM</Text></View></View>

        <View style={styles.status}><View style={styles.liveDot} /><Text style={[styles.statusText, { color: colors.muted }]}>{message}</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40, gap: 16 },
  kicker: { fontSize: 9, letterSpacing: 1.5, fontWeight: "800", marginTop: 4 },
  title: { fontSize: 28, fontWeight: "800", marginTop: -3 },
  description: { fontSize: 12, lineHeight: 18, marginTop: -5 },
  previewCard: { borderRadius: 18, borderWidth: 1, padding: 13, gap: 10 },
  previewTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  previewLabel: { color: "#9CA3B5", fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  livePill: { flexDirection: "row", gap: 5, alignItems: "center", backgroundColor: "#1A322A", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 6, backgroundColor: "#52D690" },
  liveText: { color: "#87E3B2", fontSize: 8, fontWeight: "800" },
  figureCanvas: { height: 238, overflow: "hidden", borderRadius: 12, backgroundColor: "#F0EEE9", position: "relative" },
  emptyCanvasTitle: { color: "#737A87", fontSize: 12, fontWeight: "800", letterSpacing: 1.3, textAlign: "center", marginTop: 98 },
  emptyCanvasMeta: { color: "#8C929B", fontSize: 9, textAlign: "center", marginTop: 7 },
  figureBoundary: { position: "absolute", top: 19, left: 18, right: 18, bottom: 18, borderWidth: 2, borderColor: "#5D60D6", borderStyle: "dashed", borderRadius: 4 },
  tree: { position: "absolute", width: 18, height: 18, borderRadius: 18, backgroundColor: "#F0EEE9", borderWidth: 4, borderColor: "#252830" },
  previewFooter: { flexDirection: "row", justifyContent: "space-between" },
  previewFooterText: { color: "#9CA3B5", fontSize: 9, fontWeight: "700" },
  controlSection: { gap: 0 },
  controlTitle: { fontSize: 15, fontWeight: "800", marginBottom: 2 },
  controlRow: { minHeight: 48, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  controlLabel: { fontSize: 12, fontWeight: "600" },
  twoCol: { flexDirection: "row", gap: 8 },
  outlineButton: { flex: 1, minHeight: 42, borderRadius: 10, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  outlineText: { fontSize: 11, fontWeight: "700" },
  card: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  cardKicker: { fontSize: 9, fontWeight: "800", letterSpacing: 1.3 },
  cardTitle: { fontSize: 15, fontWeight: "800", marginTop: 3 },
  unavailable: { fontSize: 9, fontWeight: "800", marginTop: 2 },
  cardDescription: { fontSize: 11, lineHeight: 17 },
  intervalRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  interval: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  primaryButton: { backgroundColor: "#5D60D6", minHeight: 42, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  primaryText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
  crsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 3 },
  crsValue: { fontSize: 12, fontWeight: "800" },
  check: { color: "#52D690", fontSize: 20 },
  measureRow: { flexDirection: "row", gap: 14, paddingTop: 4 },
  measureItem: { fontSize: 9, fontWeight: "700" },
  status: { flexDirection: "row", alignItems: "center", gap: 7 },
  statusText: { fontSize: 10 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
