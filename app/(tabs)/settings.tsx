import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { savePreference } from "@/lib/atlas-store";

export default function SettingsScreen() {
  const colors = useColors();
  const [arabic, setArabic] = useState(true);
  const [dark, setDark] = useState(true);
  const [showAttribution, setShowAttribution] = useState(true);
  const [offlineOnly, setOfflineOnly] = useState(true);
  const [message, setMessage] = useState("الإعدادات تُحفظ محليًا");

  async function toggle(key: string, value: boolean) {
    await savePreference(key, String(value));
    setMessage("تم حفظ الإعداد محليًا");
  }

  return (
    <ScreenContainer className="p-4" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: colors.primary }]}>SYSTEM / 05</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>الإعدادات</Text>
        <Text style={[styles.description, { color: colors.muted }]}>تفضيلات الجهاز، مصادر البيانات، وسياسة العمل دون اتصال.</Text>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>المظهر واللغة</Text>
          <View style={[styles.row, { borderBottomColor: colors.border }]}><View><Text style={[styles.label, { color: colors.foreground }]}>العربية / English</Text><Text style={[styles.meta, { color: colors.muted }]}>{arabic ? "واجهة عربية" : "English interface"}</Text></View><Switch value={arabic} onValueChange={(value) => { setArabic(value); toggle("language", value); }} trackColor={{ false: "#303747", true: "#5D60D6" }} thumbColor="#FFF" /></View>
          <View style={[styles.row, { borderBottomColor: colors.border }]}><View><Text style={[styles.label, { color: colors.foreground }]}>Dark workspace</Text><Text style={[styles.meta, { color: colors.muted }]}>واجهة داكنة مناسبة لـ CAD</Text></View><Switch value={dark} onValueChange={(value) => { setDark(value); toggle("dark", value); }} trackColor={{ false: "#303747", true: "#5D60D6" }} thumbColor="#FFF" /></View>
          <View style={styles.row}><View><Text style={[styles.label, { color: colors.foreground }]}>إظهار Attribution</Text><Text style={[styles.meta, { color: colors.muted }]}>التراخيص تظهر على الخرائط والتصدير</Text></View><Switch value={showAttribution} onValueChange={(value) => { setShowAttribution(value); toggle("attribution", value); }} trackColor={{ false: "#303747", true: "#5D60D6" }} thumbColor="#FFF" /></View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>الخصوصية والاتصال</Text>
          <View style={[styles.row, { borderBottomColor: colors.border }]}><View style={styles.rowInfo}><View style={styles.greenDot} /><View><Text style={[styles.label, { color: colors.foreground }]}>Offline-first</Text><Text style={[styles.meta, { color: colors.muted }]}>المعالجة والملفات محلية</Text></View></View><Switch value={offlineOnly} onValueChange={(value) => { setOfflineOnly(value); toggle("offlineOnly", value); }} trackColor={{ false: "#303747", true: "#5D60D6" }} thumbColor="#FFF" /></View>
          <Text style={[styles.note, { color: colors.muted }]}>يُستخدم الإنترنت فقط للبحث أو تنزيل مصادر مفتوحة عند طلبك. لا توجد مزامنة سحابية تلقائية.</Text>
          <View style={[styles.licenseBox, { borderColor: colors.border }]}><Text style={[styles.licenseTitle, { color: colors.foreground }]}>Open data sources</Text><Text style={[styles.meta, { color: colors.muted }]}>OpenStreetMap · ODbL 1.0</Text><Text style={[styles.meta, { color: colors.muted }]}>Overture Maps · Community Guidelines</Text><Text style={[styles.meta, { color: colors.muted }]}>DEM / Government open-data licenses</Text></View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>إصدارات وتقنيات</Text><Text style={[styles.meta, { color: colors.muted }]}>OPEN CAD ATLAS MOBILE · v0.1 workspace</Text><Text style={[styles.meta, { color: colors.muted }]}>Compose-inspired mobile UI · MVVM-ready · local persistence</Text><Text style={[styles.meta, { color: colors.muted }]}>CRS: WGS84 / UTM · DXF LWPOLYLINE target</Text></View>

        <View style={styles.footer}><View style={styles.greenDot} /><Text style={[styles.meta, { color: colors.muted }]}>{message}</Text></View>
        <Pressable onPress={() => setMessage("لا توجد بيانات خاصة أو شعارات من CAD ATLAS") } style={({ pressed }) => [styles.outlineButton, { borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.outlineText, { color: colors.foreground }]}>حول المشروع المفتوح</Text></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40, gap: 16 },
  kicker: { fontSize: 9, letterSpacing: 1.5, fontWeight: "800", marginTop: 4 },
  title: { fontSize: 28, fontWeight: "800", marginTop: -4 },
  description: { fontSize: 12, lineHeight: 18, marginTop: -5 },
  section: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 0 },
  sectionTitle: { fontSize: 15, fontWeight: "800", marginBottom: 5 },
  row: { minHeight: 62, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowInfo: { flexDirection: "row", alignItems: "center", gap: 9 },
  label: { fontSize: 12, fontWeight: "700" },
  meta: { fontSize: 10, lineHeight: 16 },
  greenDot: { width: 8, height: 8, borderRadius: 8, backgroundColor: "#52D690" },
  note: { fontSize: 10, lineHeight: 16, paddingVertical: 11 },
  licenseBox: { borderWidth: 1, borderRadius: 11, padding: 11, gap: 3 },
  licenseTitle: { fontSize: 11, fontWeight: "800", marginBottom: 2 },
  footer: { flexDirection: "row", alignItems: "center", gap: 7 },
  outlineButton: { height: 42, borderRadius: 10, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  outlineText: { fontSize: 11, fontWeight: "700" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
