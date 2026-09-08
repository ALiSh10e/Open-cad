package com.opencadatlas.mobile

import org.junit.Assert.assertEquals
import org.junit.Test

class SpatialEngineTest {
    @Test fun bboxHasFourCoordinates() {
        val bbox = "46.60,24.68,46.72,24.78"
        assertEquals(4, bbox.split(",").size)
    }
}
