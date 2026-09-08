import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { createProject, loadProjects, type Project } from "@/lib/atlas-store";

export default function ProjectsScreen() {
  const colors = useColors();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("كل المشاريع محفوظة على الجهاز");

  useEffect(() => { loadProjects().then(setProjects).finally(() => setLoading(false)); }, []);

  async function addProject() {
    if (!name.trim() || creating) return;
    setCreating(true);
    const project = await createProject(name, "Local extent / امتداد محلي", "EPSG:4326");
    setProjects((current) => [project, ...current]);
    setName("");
    setMessage(`تم إنشاء ${project.name} محليًا`);
    setCreating(false);
  }

  return (
    <ScreenContainer className="p-4" containerClassName="bg-background">
      <View style={styles.content}>
        <Text style={[styles.kicker, { color: colors.primary }]}>WORKSPACE / 04</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>المشاريع المحلية</Text>
        <Text style={[styles.description, { color: colors.muted }]}>Raw وProcessed وCache وExports وLogs تبقى ضمن مساحة التطبيق ولا تُرفع تلقائيًا.</Text>

        <View style={[styles.createCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>مشروع جديد</Text>
          <View style={styles.inputRow}><TextInput value={name} onChangeText={setName} placeholder="اسم المشروع" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} returnKeyType="done" onSubmitEditing={addProject} /><Pressable onPress={addProject} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>{creating ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.addText}>إنشاء</Text>}</Pressable></View>
          <Text style={[styles.helper, { color: colors.muted }]}>المصدر الافتراضي: OpenStreetMap · ODbL · CRS: EPSG:4326</Text>
        </View>

        {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} /> : <FlatList data={projects} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} renderItem={({ item, index }) => <View style={[styles.projectCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.projectTop}><View style={[styles.projectIcon, { backgroundColor: index === 0 ? "#5D60D6" : "#2B3447" }]}><Text style={styles.projectIconText}>⌂</Text></View><View style={styles.projectNameBlock}><Text style={[styles.projectName, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.projectRegion, { color: colors.muted }]}>{item.region}</Text></View><View style={styles.savedPill}><View style={styles.savedDot} /><Text style={styles.savedText}>SAVED</Text></View></View><View style={styles.projectMeta}><Text style={[styles.metaText, { color: colors.muted }]}>{item.crs}</Text><Text style={[styles.metaText, { color: colors.muted }]}>{item.source}</Text><Text style={[styles.metaText, { color: colors.muted }]}>{item.featureCount} features</Text></View><View style={[styles.storageLine, { borderTopColor: colors.border }]}><Text style={[styles.storageText, { color: colors.muted }]}>{item.storage}</Text><Text style={[styles.storageDate, { color: colors.muted }]}>{item.updatedAt}</Text></View></View>} />}
        <View style={styles.footer}><View style={styles.savedDot} /><Text style={[styles.footerText, { color: colors.muted }]}>{message}</Text></View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingBottom: 28, gap: 14 },
  kicker: { fontSize: 9, letterSpacing: 1.5, fontWeight: "800", marginTop: 4 },
  title: { fontSize: 28, fontWeight: "800", marginTop: -4 },
  description: { fontSize: 12, lineHeight: 18, marginTop: -5 },
  createCard: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: "800" },
  inputRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, height: 43, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 12, textAlign: "right" },
  addButton: { minWidth: 67, height: 43, borderRadius: 10, backgroundColor: "#5D60D6", alignItems: "center", justifyContent: "center" },
  addText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
  helper: { fontSize: 9, lineHeight: 14 },
  list: { gap: 10, paddingBottom: 8 },
  projectCard: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 11 },
  projectTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  projectIcon: { width: 39, height: 39, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  projectIconText: { color: "#FFF", fontSize: 18 },
  projectNameBlock: { flex: 1 },
  projectName: { fontSize: 13, fontWeight: "800" },
  projectRegion: { fontSize: 10, marginTop: 3 },
  savedPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#17372A", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4 },
  savedDot: { width: 6, height: 6, borderRadius: 6, backgroundColor: "#52D690" },
  savedText: { color: "#8BE3B4", fontSize: 8, fontWeight: "800" },
  projectMeta: { flexDirection: "row", gap: 14 },
  metaText: { fontSize: 9, fontWeight: "700" },
  storageLine: { borderTopWidth: 1, paddingTop: 9, flexDirection: "row", justifyContent: "space-between" },
  storageText: { fontSize: 9 },
  storageDate: { fontSize: 9 },
  footer: { flexDirection: "row", alignItems: "center", gap: 7, paddingTop: 2 },
  footerText: { fontSize: 10 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
