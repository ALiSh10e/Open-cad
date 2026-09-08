# OPEN CAD ATLAS MOBILE

OPEN CAD ATLAS MOBILE is now a native Android application built with Kotlin, Jetpack Compose, Room, WorkManager, and a C++17 NDK spatial engine through JNI. The repository no longer depends on Expo, React Native, Metro, Node.js, or JavaScript runtime code.

## Native architecture

The Android application is located in `app/`. `MainActivity` hosts the Compose UI and `AtlasViewModel` coordinates user actions. `AtlasDatabase` stores local dataset metadata in Room. `AtlasRepository` creates resumable WorkManager jobs for OpenStreetMap extracts and user-selected open DEM URLs. `DatasetSyncWorker` streams raw bytes into the app-private `files/atlas/{OSM|DEM}/raw` folders and records status, byte count, source, bounding box, and license in Room.

The native spatial module lives in `app/src/main/cpp/`. It provides JNI methods for polygon area, geodesic perimeter, and polyline simplification. The current UI is intentionally honest about empty state: it does not fabricate a basemap or sample geometry. It renders local selection and data status controls until the user imports or downloads open data.

## Build locally

```bash
chmod +x ./gradlew
./gradlew testDebugUnitTest
./gradlew :app:assembleDebug
./gradlew :app:assembleRelease :app:bundleRelease
```

The GitHub Actions workflow at `.github/workflows/android-build.yml` runs Kotlin unit tests, prepares Android SDK/JDK 17, compiles the C++ NDK library, builds a release APK and AAB, and uploads both artifacts. No Expo prebuild step is used.

## Data and licensing

OpenStreetMap downloads use the Overpass map endpoint and preserve ODbL attribution in the local dataset record. DEM download requires the user to provide a URL for an open, licensed DEM source; the application does not silently choose a provider or upload local files. All downloaded files remain inside the Android app-private storage unless the user explicitly exports them.

## Current boundary

This is the native foundation and working offline data pipeline. Advanced GIS readers and writers (GeoPackage, GeoTIFF decoding, SHP, DXF entities, GLB/OBJ/STL export, spatial indexing, vector tile rendering, 3D terrain, shadows, and production signing) remain subsequent native modules to add behind the same repository and WorkManager interfaces.
