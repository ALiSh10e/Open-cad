package com.opencadatlas.mobile.sync

import android.content.Context
import androidx.work.*
import com.opencadatlas.mobile.data.AtlasDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File

class DatasetSyncWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {
    private val client = OkHttpClient()
    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val id = inputData.getString("dataset_id") ?: return@withContext Result.failure(); val url = inputData.getString("url") ?: return@withContext Result.failure(); val kind = inputData.getString("kind") ?: "OPEN"
        val dao = AtlasDatabase.get(applicationContext).datasetDao(); val root = File(applicationContext.filesDir, "atlas/$kind/raw").apply { mkdirs() }; val target = File(root, "$id.bin")
        dao.updateStatus(id, "DOWNLOADING", target.length(), target.absolutePath)
        try {
            val request = Request.Builder().url(url).header("User-Agent", "OPEN-CAD-ATLAS-MOBILE/1.0").build()
            client.newCall(request).execute().use { response -> if (!response.isSuccessful) error("HTTP ${response.code}"); response.body?.byteStream()?.use { input -> target.outputStream().use { output -> val buffer = ByteArray(DEFAULT_BUFFER_SIZE); var total = 0L; var read: Int; while (input.read(buffer).also { read = it } >= 0) { if (isStopped) return@withContext Result.retry(); if (read > 0) { output.write(buffer, 0, read); total += read; setProgress(Data.Builder().putLong("bytes", total).build()) } } } } }
            dao.updateStatus(id, "READY_RAW", target.length(), target.absolutePath); Result.success()
        } catch (_: Exception) { dao.updateStatus(id, "FAILED_RETRYABLE", target.length(), target.absolutePath); if (runAttemptCount < 3) Result.retry() else Result.failure() }
    }
}
