package com.opencadatlas.mobile.data

import android.content.Context
import androidx.work.*
import com.opencadatlas.mobile.sync.DatasetSyncWorker
import kotlinx.coroutines.flow.Flow
import java.util.UUID

class AtlasRepository(private val context: Context) {
    private val dao = AtlasDatabase.get(context).datasetDao()
    val datasets: Flow<List<LocalDataset>> = dao.observeAll()
    suspend fun queueOpenStreetMap(bbox: String): UUID = queueDataset("osm-${bbox.hashCode()}", "OpenStreetMap extract", "OpenStreetMap Overpass", "OSM", bbox, "https://overpass-api.de/api/map?bbox=$bbox", "ODbL 1.0 · © OpenStreetMap contributors")
    suspend fun queueDem(bbox: String, url: String): UUID = queueDataset("dem-${bbox.hashCode()}", "DEM tile set", "User selected open DEM", "DEM", bbox, url, "Use only with a compatible open-data license")
    private suspend fun queueDataset(id: String, name: String, source: String, kind: String, bbox: String, url: String, license: String): UUID {
        dao.upsert(LocalDataset(id, name, source, kind, bbox, "", 0, "QUEUED", license))
        val input = Data.Builder().putString("dataset_id", id).putString("name", name).putString("source", source).putString("kind", kind).putString("bbox", bbox).putString("url", url).putString("license", license).build()
        val request = OneTimeWorkRequestBuilder<DatasetSyncWorker>().setInputData(input).setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build()
        WorkManager.getInstance(context).enqueue(request); return request.id
    }
}
