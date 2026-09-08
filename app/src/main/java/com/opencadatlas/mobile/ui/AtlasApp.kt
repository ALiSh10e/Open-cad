package com.opencadatlas.mobile.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Indigo = Color(0xFF8B8AF7)
private val Background = Color(0xFF0E1119)
private val SurfaceDark = Color(0xFF171B27)

@Composable
fun AtlasApp(vm: AtlasViewModel) {
    val arabic by vm.arabic.collectAsState()
    val dark by vm.dark.collectAsState()
    val datasets by vm.datasets.collectAsState()
    val bbox by vm.bbox.collectAsState()
    val status by vm.status.collectAsState()
    var tab by remember { mutableIntStateOf(0) }
    MaterialTheme(colorScheme = if (dark) darkScheme() else lightScheme()) {
        Surface(Modifier.fillMaxSize()) {
            Scaffold(
                topBar = {
                    TopAppBar(
                        title = { Column { Text("OPEN CAD ATLAS", fontWeight = FontWeight.Bold); Text(if (arabic) "مساحة CAD/GIS محلية" else "Offline CAD/GIS workspace", fontSize = 11.sp) } },
                        actions = { Icon(Icons.Default.Language, null, Modifier.clickable { vm.toggleLanguage() }.padding(12.dp)); Icon(Icons.Default.DarkMode, null, Modifier.clickable { vm.toggleTheme() }.padding(12.dp)) }
                    )
                },
                bottomBar = {
                    NavigationBar { listOf(if (arabic) "الخريطة" else "Atlas", if (arabic) "التحليل" else "Analysis", if (arabic) "المشاريع" else "Projects", if (arabic) "الإعدادات" else "Settings").forEachIndexed { index, label ->
                        NavigationBarItem(selected = tab == index, onClick = { tab = index }, icon = { Icon(if (index == 0) Icons.Default.Map else if (index == 2) Icons.Default.Folder else Icons.Default.Settings, null) }, label = { Text(label) })
                    } }
                }
            ) { padding ->
                when (tab) {
                    0 -> AtlasScreen(vm, bbox, status, arabic, Modifier.padding(padding))
                    1 -> AnalysisScreen(arabic, Modifier.padding(padding))
                    2 -> ProjectsScreen(datasets, arabic, Modifier.padding(padding))
                    else -> SettingsScreen(vm, arabic, Modifier.padding(padding))
                }
            }
        }
    }
}

@Composable
private fun AtlasScreen(vm: AtlasViewModel, bbox: String, status: String, arabic: Boolean, modifier: Modifier) {
    var tool by remember { mutableStateOf("RECTANGLE") }
    var demUrl by remember { mutableStateOf("") }
    LazyColumn(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { Text("ATLAS / 01", color = Indigo, fontSize = 11.sp, fontWeight = FontWeight.Bold); Text(if (arabic) "لوحة الخريطة" else "Map canvas", fontSize = 27.sp, fontWeight = FontWeight.Bold) }
        item {
            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF151924)), shape = RoundedCornerShape(18.dp)) {
                Box(Modifier.fillMaxWidth().height(300.dp)) {
                    Canvas(Modifier.fillMaxSize()) { for (x in 0..12) drawLine(Color(0xFF252B3B), Offset(x * size.width / 12, 0f), Offset(x * size.width / 12, size.height)); for (y in 0..9) drawLine(Color(0xFF252B3B), Offset(0f, y * size.height / 9), Offset(size.width, y * size.height)); drawLine(Indigo, Offset(size.width - 34, 28f), Offset(size.width - 34, 54f), 2f, StrokeCap.Round) }
                    Column(Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally) { Text(if (arabic) "لا توجد بيانات محملة" else "NO DATASET LOADED", color = Color(0xFF737B90), fontWeight = FontWeight.Bold); Text(if (arabic) "استورد بيانات مفتوحة للرسم محليًا" else "Import open data to render locally", color = Color(0xFF555D70), fontSize = 11.sp) }
                    Text("N", Modifier.align(Alignment.TopEnd).padding(14.dp), color = Color.White, fontWeight = FontWeight.Bold)
                    Text("WGS84 · metric · offline", Modifier.align(Alignment.BottomStart).padding(14.dp), color = Color(0xFF9CA3B5), fontSize = 10.sp)
                }
            }
        }
        item { Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) { listOf("RECTANGLE", "POLYGON", "CIRCLE", "EXTENT").forEach { value -> Surface(color = if (tool == value) Indigo else SurfaceDark, shape = RoundedCornerShape(8.dp), modifier = Modifier.clickable { tool = value }) { Text(value, Modifier.padding(horizontal = 10.dp, vertical = 9.dp), color = Color.White, fontSize = 9.sp) } } } }
        item { Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { Metric(Modifier.weight(1f), "—", if (arabic) "المساحة" else "Area"); Metric(Modifier.weight(1f), "—", if (arabic) "المحيط" else "Perimeter"); Metric(Modifier.weight(1f), "—", if (arabic) "الأبعاد" else "Dimensions") } }
        item {
            Card(colors = CardDefaults.cardColors(containerColor = SurfaceDark)) {
                Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(if (arabic) "تنزيل بيانات مفتوحة محليًا" else "Download open data locally", fontWeight = FontWeight.Bold)
                    OutlinedTextField(value = bbox, onValueChange = vm::setBbox, label = { Text("BBOX west,south,east,north") }, modifier = Modifier.fillMaxWidth(), singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Ascii))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { Button(onClick = vm::syncOsm) { Text("OSM") }; OutlinedButton(onClick = { vm.syncDem(demUrl) }) { Text("DEM") } }
                    OutlinedTextField(value = demUrl, onValueChange = { demUrl = it }, label = { Text(if (arabic) "رابط DEM مفتوح" else "Open DEM URL") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                    Text(status, color = Color(0xFF9CA3B5), fontSize = 11.sp)
                }
            }
        }
        item { Text(if (arabic) "© OpenStreetMap contributors · ODbL 1.0 · الملفات لا تغادر الجهاز" else "© OpenStreetMap contributors · ODbL 1.0 · files stay on-device", color = Color(0xFF9CA3B5), fontSize = 10.sp) }
    }
}

@Composable private fun Metric(modifier: Modifier, value: String, label: String) { Card(modifier, colors = CardDefaults.cardColors(containerColor = SurfaceDark)) { Column(Modifier.padding(11.dp)) { Text(value, fontWeight = FontWeight.Bold); Text(label, color = Color(0xFF9CA3B5), fontSize = 10.sp) } } }

@Composable private fun AnalysisScreen(arabic: Boolean, modifier: Modifier) { LazyColumn(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) { item { Text("ANALYSIS / 02", color = Indigo, fontSize = 11.sp, fontWeight = FontWeight.Bold); Text("Figure-Ground", fontSize = 27.sp, fontWeight = FontWeight.Bold); Text(if (arabic) "معاينة أحادية اللون دون بيانات وهمية" else "Monochrome renderer with no fabricated data", color = Color(0xFF9CA3B5)) }; item { Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF10131B))) { Box(Modifier.fillMaxWidth().height(250.dp), contentAlignment = Alignment.Center) { Text("NO DATASET LOADED", color = Color(0xFF737A87), fontWeight = FontWeight.Bold) } } }; item { Card(colors = CardDefaults.cardColors(containerColor = SurfaceDark)) { Column(Modifier.padding(14.dp)) { Text(if (arabic) "DEM / تضاريس" else "DEM / Terrain", fontWeight = FontWeight.Bold); Text("Hillshade · Slope · Aspect · Contours", color = Color(0xFF9CA3B5)); Spacer(Modifier.height(8.dp)); Text("0.5m · 1m · 2m · 5m · 10m · 20m · 50m", color = Indigo, fontSize = 12.sp) } } } } }

@Composable private fun ProjectsScreen(datasets: List<com.opencadatlas.mobile.data.LocalDataset>, arabic: Boolean, modifier: Modifier) { LazyColumn(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) { item { Text("WORKSPACE / 03", color = Indigo, fontSize = 11.sp, fontWeight = FontWeight.Bold); Text(if (arabic) "المشاريع المحلية" else "Local projects", fontSize = 27.sp, fontWeight = FontWeight.Bold) }; if (datasets.isEmpty()) item { Text(if (arabic) "لا توجد بيانات بعد. استخدم OSM أو DEM من شاشة Atlas." else "No local datasets yet. Queue OSM or DEM from Atlas.", color = Color(0xFF9CA3B5)) }; items(datasets) { dataset -> Card(colors = CardDefaults.cardColors(containerColor = SurfaceDark)) { Column(Modifier.padding(14.dp)) { Text(dataset.name, fontWeight = FontWeight.Bold); Text("${dataset.kind} · ${dataset.status}", color = Color(0xFF9CA3B5), fontSize = 11.sp); Text("${dataset.bbox} · ${dataset.bytes} bytes", color = Color(0xFF9CA3B5), fontSize = 10.sp); Text(dataset.license, color = Color(0xFF9CA3B5), fontSize = 10.sp) } } } } }

@Composable private fun SettingsScreen(vm: AtlasViewModel, arabic: Boolean, modifier: Modifier) { Column(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) { Text("SYSTEM / 04", color = Indigo, fontSize = 11.sp, fontWeight = FontWeight.Bold); Text(if (arabic) "الإعدادات" else "Settings", fontSize = 27.sp, fontWeight = FontWeight.Bold); Card(colors = CardDefaults.cardColors(containerColor = SurfaceDark)) { Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) { Text("Offline-first", fontWeight = FontWeight.Bold); Text(if (arabic) "Room وWorkManager يحفظان البيانات الخام محليًا." else "Room and WorkManager keep raw data locally.", color = Color(0xFF9CA3B5)); OutlinedButton(onClick = vm::toggleLanguage) { Text(if (arabic) "العربية / English" else "English / العربية") }; OutlinedButton(onClick = vm::toggleTheme) { Text(if (arabic) "تبديل الوضع الداكن/الفاتح" else "Toggle dark/light") } } } } }

private fun darkScheme() = darkColorScheme(primary = Indigo, background = Background, surface = SurfaceDark)
private fun lightScheme() = lightColorScheme(primary = Color(0xFF5D60D6))
