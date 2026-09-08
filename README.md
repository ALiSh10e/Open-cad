# OPEN CAD ATLAS MOBILE

Offline-first mobile workspace for open-data CAD/GIS studies. The current WebDev Mobile build is an Expo/React Native implementation optimized for an Android-like mobile preview. It intentionally keeps project state in local AsyncStorage and does not upload user files.

## Implemented workspace flows

- Atlas canvas with OSM attribution, local vector-style rendering, north arrow, scale, grid, coordinates, and map controls.
- Local selection tools for rectangle, polygon, circle, and current extent with metric area, perimeter, dimensions, and center coordinates.
- Geometry processing state that distinguishes raw data from locally cleaned/closed/simplified output.
- Figure-Ground preview with monochrome CAD controls for roads, water, rail, trees, labels, and boundary.
- Layer Manager with visibility toggles for roads, water, rail, trees, boundaries, and text.
- Terrain/DEM analysis controls for GeoTIFF/XYZ import direction, Hillshade/Slope/Aspect/Contours, and contour intervals from 0.5 m to 50 m.
- CRS panel for WGS84 / UTM and EPSG reference metadata.
- Local project list with Raw, Processed, Cache, Exports, and Logs workspace metadata.
- Arabic-first UI with English technical labels, dark visual system, open-data attribution, and no CAD ATLAS proprietary marks or data.

## Scope boundary

This session's WebDev Mobile scaffold is Expo/React Native/TypeScript, not a compiled Kotlin/Jetpack Compose Android project. Native Kotlin modules (Room, DataStore, WorkManager, C++/NDK, GPU 3D, GeoTIFF/SHX readers, and binary DXF/GLB/STL writers) require a separate Android Studio/Gradle repository. The UI is structured so those native modules can be connected behind the local workspace and renderer interfaces without changing the user flows.

The preview uses a local vector canvas rather than shipping a proprietary basemap or fabricated geospatial dataset. Network geocoding is only requested when the user explicitly searches; project persistence remains local.

## Quality notes

TypeScript is checked through the project `check` script. The app is designed for the Expo mobile preview and has no empty primary actions. The final checkpoint should be created after visual verification.
