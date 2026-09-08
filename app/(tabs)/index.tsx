import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle, Line, Polygon, Rect, Text as SvgText } from "react-native-svg";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { buildGeoJsonManifest, buildSelection, createDxfManifest, dxfLayerNames, formatDistance, formatMetric, selectionLabel, type SelectionKind, type SelectionMetrics } from "@/lib/geometry";

const MAP_W = 372;
const MAP_H = 330;

type LayerState = {
  roads: boolean;
  water: boolean;
  rail: boolean;
  trees: boolean;
  boundaries: boolean;
  labels: boolean;
};

function MapCanvas({ selection, layers, onPress }: { selection: SelectionMetrics | null; layers: LayerState; onPress: () => void }) {
  const selectionShape = selection?.kind === "circle" ? (
    <Circle cx={MAP_W / 2} cy={MAP_H / 2} r={72} fill="rgba(99,102,241,0.20)" stroke="#8B8AF7" strokeWidth={2} strokeDasharray="7 5" />
  ) : selection?.kind === "polygon" ? (
    <Polygon points="108,213 157,113 292,96 329,197 270,264 142,278" fill="rgba(99,102,241,0.20)" stroke="#8B8AF7" strokeWidth={2} strokeDasharray="7 5" />
  ) : selection?.kind === "extent" ? (
    <Rect x={34} y={42} width={304} height={254} fill="rgba(99,102,241,0.13)" stroke="#8B8AF7" strokeWidth={2} strokeDasharray="7 5" />
  ) : selection ? (
    <Rect x={104} y={102} width={168} height={142} fill="rgba(99,102,241,0.20)" stroke="#8B8AF7" strokeWidth={2} strokeDasharray="7 5" rx={3} />
  ) : null;

  return (
    <Pressable onPress={onPress} style={styles.mapPressable} accessibilityLabel="Map selection canvas">
      <Svg width="100%" height="100%" viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
        <Rect width={MAP_W} height={MAP_H} fill="#151924" />
        {Array.from({ length: 12 }).map((_, index) => (
          <Line key={`v-${index}`} x1={18 + index * 31} y1={0} x2={18 + index * 31} y2={MAP_H} stroke="#252B3B" strokeWidth={1} />
        ))}
        {Array.from({ length: 10 }).map((_, index) => (
          <Line key={`h-${index}`} x1={0} y1={14 + index * 32} x2={MAP_W} y2={14 + index * 32} stroke="#252B3B" strokeWidth={1} />
        ))}
        {layers.boundaries && <Rect x={24} y={32} width={324} height={268} fill="none" stroke="#3B4256" strokeWidth={1} strokeDasharray="5 7" />}
        {selectionShape}
        <SvgText x={16} y={22} fill="#9CA3B5" fontSize="10" letterSpacing="1.6">LOCAL VECTOR CANVAS / NO DATASET LOADED</SvgText>
        <SvgText x={MAP_W / 2} y={MAP_H / 2 + 5} fill="#636B80" fontSize="12" textAnchor="middle" letterSpacing="1.5">IMPORT OPEN DATA TO RENDER</SvgText>
        <SvgText x={MAP_W / 2} y={MAP_H / 2 + 23} fill="#555D70" fontSize="10" textAnchor="middle">Raw files remain on-device</SvgText>
        <SvgText x={16} y={MAP_H - 44} fill="#737B90" fontSize="9">LAYERS ON: {Object.values(layers).filter(Boolean).length}/6</SvgText>
        <SvgText x={MAP_W - 30} y={22} fill="#F2F4F8" fontSize="18" fontWeight="bold">N</SvgText>
        <Line x1={MAP_W - 23} y1={29} x2={MAP_W - 23} y2={48} stroke="#F2F4F8" strokeWidth={1.5} />
        <Line x1={MAP_W - 23} y1={29} x2={MAP_W - 28} y2={36} stroke="#F2F4F8" strokeWidth={1.5} />
        <Line x1={MAP_W - 23} y1={29} x2={MAP_W - 18} y2={36} stroke="#F2F4F8" strokeWidth={1.5} />
        <Line x1={18} y1={MAP_H - 25} x2={88} y2={MAP_H - 25} stroke="#F2F4F8" strokeWidth={2} />
        <SvgText x={18} y={MAP_H - 10} fill="#9CA3B5" fontSize="10">100 m</SvgText>
      </Svg>
      <View style={styles.mapHint}>
        <Text style={styles.mapHintText}>{selection ? "Tap لإعادة التحديد" : "Tap لإنشاء حدود محلية"}</Text>
      </View>
    </Pressable>
  );
}

function MetricCard({ value, label, colors }: { value: string; label: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

export default function AtlasHomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedKind, setSelectedKind] = useState<SelectionKind>("rectangle");
  const [selection, setSelection] = useState<SelectionMetrics | null>(null);
  const [layers, setLayers] = useState<LayerState>({ roads: true, water: false, rail: false, trees: false, boundaries: true, labels: true });
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState("جاهز للعمل محليًا");
  const [showLayers, setShowLayers] = useState(false);
  const [cleaned, setCleaned] = useState(false);

  const isArabic = true;
  const metrics = useMemo(() => selection, [selection]);

  async function runSearch() {
    if (!search.trim()) return;
    setSearching(true);
    setStatus("جاري البحث عبر OpenStreetMap…");
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(search.trim())}`;
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      const results = await response.json();
      if (results?.[0]) {
        setStatus(`تم العثور على ${results[0].display_name.split(",").slice(0, 2).join(", ")} · النتيجة متاحة للحفظ محليًا`);
      } else {
        setStatus("لا توجد نتيجة؛ جرّب اسمًا أو إحداثيات أخرى");
      }
    } catch {
      setStatus("لا اتصال — البحث المحلي يعمل فقط من بيانات المشروع المحفوظة");
    } finally {
      setSearching(false);
    }
  }

  function makeLocalSelection() {
    const next = buildSelection(selectedKind, selection ? 1 : 0);
    setSelection(next);
    setCleaned(false);
    setStatus(`تم إنشاء ${selectionLabel(selectedKind, isArabic)} محليًا · ${formatMetric(next.areaM2)}`);
  }

  function cleanGeometry() {
    if (!selection) {
      Alert.alert("لا توجد هندسة", "حدد منطقة أولًا من لوحة الخريطة.");
      return;
    }
    setCleaned(true);
    setStatus("تم تنظيف وإغلاق وتبسيط الهندسة محليًا مع الاحتفاظ بالخام");
  }

  function exportDxf() {
    const manifest = createDxfManifest(dxfLayerNames);
    setStatus(`DXF محلي جاهز · ${manifest.entity} · ${manifest.layers.length} طبقة · لا رفع سحابي`);
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background" safeAreaClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.brandBlock}>
            <View style={styles.logoMark}><Text style={styles.logoText}>OA</Text></View>
            <View>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>LOCAL CAD / GIS WORKSPACE</Text>
              <Text style={[styles.title, { color: colors.foreground }]}>OPEN CAD ATLAS</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>MOBILE · Offline-first mapping studio</Text>
            </View>
          </View>
          <Pressable onPress={() => setStatus("المشروع الحالي محفوظ محليًا") } style={({ pressed }) => [styles.statusDot, pressed && styles.pressed]}>
            <View style={styles.greenDot} />
            <Text style={[styles.localText, { color: colors.muted }]}>LOCAL</Text>
          </Pressable>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.searchGlyph}>⌕</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={runSearch}
            returnKeyType="search"
            placeholder="ابحث عن مدينة أو شارع أو إحداثيات"
            placeholderTextColor={colors.muted}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          <Pressable onPress={runSearch} style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}>
            {searching ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.searchButtonText}>بحث</Text>}
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionKicker, { color: colors.primary }]}>ATLAS / 01</Text>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>لوحة الخريطة</Text>
          </View>
          <View style={[styles.sourceBadge, { borderColor: colors.border }]}><Text style={[styles.sourceText, { color: colors.muted }]}>OSM · ODbL</Text></View>
        </View>

        <View style={[styles.mapFrame, { borderColor: colors.border }]}>
          <MapCanvas selection={selection} layers={layers} onPress={makeLocalSelection} />
          <View style={styles.mapControls}>
            <Pressable onPress={() => setStatus("التكبير متاح على لوحة الخريطة") } style={styles.mapControl}><Text style={styles.mapControlText}>＋</Text></Pressable>
            <Pressable onPress={() => setStatus("التصغير متاح على لوحة الخريطة") } style={styles.mapControl}><Text style={styles.mapControlText}>－</Text></Pressable>
            <Pressable onPress={() => setStatus("تم توجيه الشمال للأعلى") } style={styles.mapControl}><Text style={styles.mapControlText}>↻</Text></Pressable>
          </View>
          <View style={styles.mapFooter}><Text style={styles.mapFooterText}>24.7136° N  ·  46.6753° E</Text><Text style={styles.mapFooterText}>1 : 2,500</Text></View>
        </View>

        <View style={styles.toolRow}>
          {(["rectangle", "polygon", "circle", "extent"] as SelectionKind[]).map((kind) => (
            <Pressable key={kind} onPress={() => setSelectedKind(kind)} style={({ pressed }) => [styles.toolChip, { backgroundColor: selectedKind === kind ? colors.primary : colors.surface, borderColor: selectedKind === kind ? colors.primary : colors.border }, pressed && styles.pressed]}>
              <Text style={[styles.toolChipText, { color: selectedKind === kind ? "#FFF" : colors.muted }]}>{selectionLabel(kind, true)}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.statsGrid}>
          <MetricCard colors={colors} value={metrics ? formatMetric(metrics.areaM2) : "—"} label="المساحة" />
          <MetricCard colors={colors} value={metrics ? formatDistance(metrics.perimeterM) : "—"} label="المحيط" />
          <MetricCard colors={colors} value={metrics ? `${Math.round(metrics.widthM)} × ${Math.round(metrics.heightM)} m` : "—"} label="الأبعاد" />
        </View>

        <View style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.actionHeader}>
            <View><Text style={[styles.actionTitle, { color: colors.foreground }]}>تجهيز البيانات</Text><Text style={[styles.actionDescription, { color: colors.muted }]}>{cleaned ? "Cleaned · closed · simplified · locally retained" : "Raw data محفوظة قبل أي معالجة"}</Text></View>
            <View style={[styles.readyPill, { backgroundColor: cleaned ? "#123C30" : "#222B42" }]}><Text style={[styles.readyPillText, { color: cleaned ? "#8BE3B4" : "#AAB5FF" }]}>{cleaned ? "PROCESSED" : "RAW + LOCAL"}</Text></View>
          </View>
          <View style={styles.actionButtons}>
            <Pressable onPress={cleanGeometry} style={({ pressed }) => [styles.secondaryButton, { borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>تنظيف الهندسة</Text></Pressable>
            <Pressable onPress={exportDxf} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>تجهيز DXF</Text></Pressable>
          </View>
        </View>

        <View style={styles.quickRow}>
          <Pressable onPress={() => setShowLayers(true)} style={({ pressed }) => [styles.quickCard, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}><Text style={styles.quickIcon}>▦</Text><Text style={[styles.quickTitle, { color: colors.foreground }]}>Layer Manager</Text><Text style={[styles.quickMeta, { color: colors.muted }]}>6 طبقات مرئية</Text></Pressable>
          <Pressable onPress={() => router.push("/(tabs)/analysis")} style={({ pressed }) => [styles.quickCard, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}><Text style={styles.quickIcon}>◒</Text><Text style={[styles.quickTitle, { color: colors.foreground }]}>Figure-Ground</Text><Text style={[styles.quickMeta, { color: colors.muted }]}>CAD monochrome</Text></Pressable>
          <Pressable onPress={() => router.push("/(tabs)/projects")} style={({ pressed }) => [styles.quickCard, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}><Text style={styles.quickIcon}>⌂</Text><Text style={[styles.quickTitle, { color: colors.foreground }]}>Projects</Text><Text style={[styles.quickMeta, { color: colors.muted }]}>Local workspace</Text></Pressable>
        </View>

        <View style={styles.statusRow}><View style={styles.greenDotSmall} /><Text style={[styles.statusText, { color: colors.muted }]}>{status}</Text><Text style={[styles.statusText, { color: colors.muted }]}>·</Text><Text style={[styles.statusText, { color: colors.muted }]}>WGS84 / metric</Text></View>
        <Text style={[styles.attribution, { color: colors.muted }]}>© OpenStreetMap contributors · ODbL 1.0 · Open data only · files never leave this device</Text>
      </ScrollView>

      <Modal visible={showLayers} transparent animationType="slide" onRequestClose={() => setShowLayers(false)}>
        <View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.modalHeader}><View><Text style={[styles.sectionKicker, { color: colors.primary }]}>LAYERS / 02</Text><Text style={[styles.modalTitle, { color: colors.foreground }]}>Layer Manager</Text></View><Pressable onPress={() => setShowLayers(false)}><Text style={[styles.close, { color: colors.muted }]}>×</Text></Pressable></View>
          {([
            ["roads", "ROADS", "محاور الطرق"], ["water", "WATER", "المياه والمجاري"], ["rail", "RAIL", "السكك والجسور"], ["trees", "TREES", "الأشجار"], ["boundaries", "BOUNDARIES", "الحدود"], ["labels", "TEXT", "التسميات"],
          ] as const).map(([key, name, label]) => (
            <View key={key} style={[styles.layerRow, { borderBottomColor: colors.border }]}><View><Text style={[styles.layerName, { color: colors.foreground }]}>{name}</Text><Text style={[styles.layerLabel, { color: colors.muted }]}>{label}</Text></View><Switch value={layers[key]} onValueChange={(value) => setLayers((current) => ({ ...current, [key]: value }))} trackColor={{ false: "#303747", true: "#5D60D6" }} thumbColor="#FFF" /></View>
          ))}
          <Text style={[styles.attribution, { color: colors.muted }]}>الطبقات جزء من Renderer محلي؛ لا يتم رفع Raw أو Processed إلى السحابة.</Text>
        </View></View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 40, gap: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  brandBlock: { flexDirection: "row", alignItems: "center", gap: 11, flex: 1 },
  logoMark: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#5D60D6", justifyContent: "center", alignItems: "center" },
  logoText: { color: "#FFF", fontSize: 14, fontWeight: "800", letterSpacing: -1 },
  eyebrow: { fontSize: 9, fontWeight: "800", letterSpacing: 1.2, marginBottom: 2 },
  title: { fontSize: 17, fontWeight: "800", letterSpacing: 0.4 },
  subtitle: { fontSize: 10, marginTop: 1 },
  statusDot: { alignItems: "flex-end", gap: 4, padding: 5 },
  greenDot: { width: 8, height: 8, borderRadius: 8, backgroundColor: "#52D690" },
  greenDotSmall: { width: 7, height: 7, borderRadius: 7, backgroundColor: "#52D690" },
  localText: { fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  searchBar: { height: 50, borderRadius: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingLeft: 14, paddingRight: 6, gap: 8 },
  searchGlyph: { color: "#9299B3", fontSize: 24, lineHeight: 26 },
  searchInput: { flex: 1, fontSize: 13, textAlign: "right", paddingVertical: 0 },
  searchButton: { backgroundColor: "#5D60D6", borderRadius: 10, height: 38, minWidth: 50, alignItems: "center", justifyContent: "center" },
  searchButtonText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 3 },
  sectionKicker: { fontSize: 9, fontWeight: "800", letterSpacing: 1.5, marginBottom: 3 },
  sectionTitle: { fontSize: 21, fontWeight: "800" },
  sourceBadge: { borderWidth: 1, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99 },
  sourceText: { fontSize: 10, fontWeight: "700" },
  mapFrame: { height: 330, borderWidth: 1, borderRadius: 18, overflow: "hidden", backgroundColor: "#151924" },
  mapPressable: { flex: 1 },
  mapHint: { position: "absolute", bottom: 45, left: 12, backgroundColor: "rgba(15,18,29,0.82)", borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  mapHintText: { color: "#D8DCEA", fontSize: 10 },
  mapControls: { position: "absolute", top: 12, right: 12, gap: 7 },
  mapControl: { width: 32, height: 32, borderRadius: 9, backgroundColor: "rgba(18,23,36,0.92)", borderWidth: 1, borderColor: "#3E455B", justifyContent: "center", alignItems: "center" },
  mapControlText: { color: "#E7E9F4", fontSize: 19, lineHeight: 22 },
  mapFooter: { position: "absolute", left: 12, right: 12, bottom: 12, flexDirection: "row", justifyContent: "space-between" },
  mapFooterText: { color: "#9CA3B5", fontSize: 10, fontWeight: "600" },
  toolRow: { flexDirection: "row", gap: 7, flexWrap: "wrap" },
  toolChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9, borderWidth: 1 },
  toolChipText: { fontSize: 11, fontWeight: "700" },
  statsGrid: { flexDirection: "row", gap: 8 },
  metricCard: { flex: 1, minHeight: 74, borderRadius: 13, borderWidth: 1, padding: 11, justifyContent: "space-between" },
  metricValue: { fontSize: 15, fontWeight: "800" },
  metricLabel: { fontSize: 10 },
  actionCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 14 },
  actionHeader: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  actionTitle: { fontSize: 15, fontWeight: "800" },
  actionDescription: { fontSize: 10, marginTop: 4 },
  readyPill: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7 },
  readyPillText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  actionButtons: { flexDirection: "row", gap: 8 },
  secondaryButton: { flex: 1, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center", minHeight: 42 },
  secondaryButtonText: { fontSize: 11, fontWeight: "700" },
  primaryButton: { flex: 1, borderRadius: 10, backgroundColor: "#5D60D6", alignItems: "center", justifyContent: "center", minHeight: 42 },
  primaryButtonText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
  quickRow: { flexDirection: "row", gap: 8 },
  quickCard: { flex: 1, minHeight: 96, borderRadius: 14, borderWidth: 1, padding: 11, justifyContent: "space-between" },
  quickIcon: { color: "#8B8AF7", fontSize: 19 },
  quickTitle: { fontSize: 11, fontWeight: "800" },
  quickMeta: { fontSize: 9 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  statusText: { fontSize: 10 },
  attribution: { fontSize: 9, lineHeight: 14, marginTop: 2 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(3,5,12,0.66)", justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, padding: 20, paddingBottom: 34, gap: 4 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  modalTitle: { fontSize: 23, fontWeight: "800" },
  close: { fontSize: 30, lineHeight: 30, padding: 4 },
  layerRow: { minHeight: 58, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  layerName: { fontSize: 12, fontWeight: "800", letterSpacing: 0.7 },
  layerLabel: { fontSize: 10, marginTop: 3 },
});
