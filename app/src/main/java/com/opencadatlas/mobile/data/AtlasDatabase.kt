package com.opencadatlas.mobile.data

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "local_datasets")
data class LocalDataset(@PrimaryKey val id: String, val name: String, val source: String, val kind: String, val bbox: String, val filePath: String, val bytes: Long, val status: String, val license: String, val updatedAt: Long = System.currentTimeMillis())

@Dao
interface DatasetDao {
    @Query("SELECT * FROM local_datasets ORDER BY updatedAt DESC") fun observeAll(): Flow<List<LocalDataset>>
    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun upsert(dataset: LocalDataset)
    @Query("UPDATE local_datasets SET status = :status, bytes = :bytes, filePath = :path, updatedAt = :updatedAt WHERE id = :id") suspend fun updateStatus(id: String, status: String, bytes: Long, path: String, updatedAt: Long = System.currentTimeMillis())
}

@Database(entities = [LocalDataset::class], version = 1, exportSchema = false)
abstract class AtlasDatabase : RoomDatabase() {
    abstract fun datasetDao(): DatasetDao
    companion object { @Volatile private var INSTANCE: AtlasDatabase? = null; fun get(context: Context): AtlasDatabase = INSTANCE ?: synchronized(this) { INSTANCE ?: Room.databaseBuilder(context, AtlasDatabase::class.java, "open_cad_atlas.db").build().also { INSTANCE = it } } }
}
