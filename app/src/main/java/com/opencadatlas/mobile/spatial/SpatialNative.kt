package com.opencadatlas.mobile.spatial

object SpatialNative {
    init { System.loadLibrary("atlas_spatial") }
    external fun polygonAreaMetersSquared(points: DoubleArray): Double
    external fun polygonPerimeterMeters(points: DoubleArray): Double
    external fun simplifyPolyline(points: DoubleArray, tolerance: Double): DoubleArray
}
