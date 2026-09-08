import { describe, expect, it } from "vitest";
import { buildGeoJsonManifest, buildSelection, createDxfManifest, dxfLayerNames, formatDistance, formatMetric } from "../lib/geometry";

describe("local geometry engine", () => {
  it("calculates rectangle metrics in meters", () => {
    const metrics = buildSelection("rectangle");
    expect(metrics.areaM2).toBe(24288);
    expect(metrics.perimeterM).toBe(632);
    expect(metrics.widthM).toBe(184);
    expect(metrics.heightM).toBe(132);
  });

  it("calculates circle area and perimeter", () => {
    const metrics = buildSelection("circle");
    expect(metrics.areaM2).toBeGreaterThan(13000);
    expect(metrics.perimeterM).toBeGreaterThan(400);
    expect(metrics.widthM).toBe(metrics.heightM);
  });

  it("formats metric values for a survey workflow", () => {
    expect(formatMetric(24288)).toBe("2.43 ha");
    expect(formatMetric(840)).toBe("840 m²");
    expect(formatDistance(632)).toBe("632 m");
  });

  it("creates an explicit local DXF manifest with CAD layers", () => {
    const manifest = createDxfManifest(dxfLayerNames);
    expect(manifest.localOnly).toBe(true);
    expect(manifest.entity).toBe("LWPOLYLINE");
    expect(manifest.units).toBe("meters");
    expect(manifest.layers).toContain("SITE_BOUNDARY");
    expect(manifest.layers).toContain("CONTOURS");
  });

  it("keeps GeoJSON metadata in WGS84", () => {
    const manifest = buildGeoJsonManifest(buildSelection("polygon"));
    expect(manifest.type).toBe("FeatureCollection");
    expect(manifest.crs).toBe("EPSG:4326");
    expect(manifest.features[0].properties.source).toBe("local selection");
  });
});
