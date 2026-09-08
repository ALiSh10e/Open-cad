package com.opencadatlas.mobile.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.opencadatlas.mobile.data.AtlasRepository
import com.opencadatlas.mobile.data.LocalDataset
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class AtlasViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = AtlasRepository(application)
    val datasets: StateFlow<List<LocalDataset>> = repository.datasets.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
    val arabic = MutableStateFlow(true)
    val dark = MutableStateFlow(true)
    val bbox = MutableStateFlow("")
    val status = MutableStateFlow("جاهز للعمل دون اتصال")
    fun setBbox(value: String) { bbox.value = value }
    fun toggleLanguage() { arabic.value = !arabic.value }
    fun toggleTheme() { dark.value = !dark.value }
    fun syncOsm() = viewModelScope.launch { if (bbox.value.isBlank()) { status.value = "أدخل BBOX بصيغة west,south,east,north"; return@launch }; status.value = "تمت جدولة تنزيل OSM محليًا"; repository.queueOpenStreetMap(bbox.value) }
    fun syncDem(url: String) = viewModelScope.launch { if (bbox.value.isBlank() || url.isBlank()) { status.value = "أدخل BBOX ورابط DEM مفتوحًا"; return@launch }; status.value = "تمت جدولة تنزيل DEM محليًا"; repository.queueDem(bbox.value, url) }
}
