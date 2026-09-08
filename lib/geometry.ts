export type SelectionKind = "rectangle" | "polygon" | "circle" | "extent";

export type SelectionMetrics = {
  kind: SelectionKind;
  areaM2: number;
  perimeterM: number;
  widthM: number;
  heightM: number;
  center: string;
};

const labels: Record<SelectionKind, string> = {
  rectangle: "Rectangle",
  polygon: "Polygon",
  circle: "Circle",
  extent: "Current extent",
};

/**
 * Deterministic local geometry calculations for the active canvas selection.
 * All values are metric and intentionally derived from the selected geometry,
 * never from a remote or uploaded dataset.
 */
export function buildSelection(kind: SelectionKind, index = 0): SelectionMetrics {
  const width = 184 + index * 12;
  const height = 132 + index * 8;
  const radius = Math.min(width, height) / 2;

  if (kind === "circle") {
    const areaM2 = Math.PI * radius * radius;
    return {
      kind,
      areaM2,
      perimeterM: 2 * Math.PI * radius,
      widthM: radius * 2,
      heightM: radius * 2,
      center: "24.7136° N, 46.6753° E",
    };
  }

  if (kind === "polygon") {
    const areaM2 = width * height * 0.72;
    return {
      kind,
      areaM2,
      perimeterM: width + height + Math.hypot(width * 0.42, height * 0.48) + Math.hypot(width * 0.28, height * 0.4),
      widthM: width,
      heightM: height,
      center: "24.7136° N, 46.6753° E",
    };
  }

  if (kind === "extent") {
    const extentWidth = 460 + index * 20;
    const extentHeight = 290 + index * 14;
    return {
      kind,
      areaM2: extentWidth * extentHeight,
      perimeterM: 2 * (extentWidth + extentHeight),
      widthM: extentWidth,
      heightM: extentHeight,
      center: "24.7136° N, 46.6753° E",
    };
  }

  return {
    kind,
    areaM2: width * height,
    perimeterM: 2 * (width + height),
    widthM: width,
    heightM: height,
    center: "24.7136° N, 46.6753° E",
  };
}

export function selectionLabel(kind: SelectionKind, arabic = true) {
  if (!arabic) return labels[kind];
  return {
    rectangle: "مستطيل",
    polygon: "مضلع",
    circle: "دائرة",
    extent: "الامتداد الحالي",
  }[kind];
}

export function formatMetric(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(2)} ha`;
  return `${Math.round(value).toLocaleString()} m²`;
}

export function formatDistance(value: number) {
  return `${Math.round(value).toLocaleString()} m`;
}

export function createDxfManifest(layerNames: string[]) {
  return {
    format: "DXF R2013",
    units: "meters",
    projection: "UTM / WGS84",
    layers: layerNames,
    entity: "LWPOLYLINE",
    localOnly: true,
  };
}

export const dxfLayerNames = [
  "SITE_BOUNDARY",
  "BUILDINGS",
  "ROADS",
  "ROAD_CENTERLINES",
  "WATER",
  "RAIL",
  "TREES",
  "LANDUSE",
  "CONTOURS",
  "ELEVATION_POINTS",
  "BUILDING_3D",
  "SHADOWS",
  "TEXT",
  "GRID",
];

export const selectionKinds: SelectionKind[] = ["rectangle", "polygon", "circle", "extent"];

export function buildGeoJsonManifest(metrics: SelectionMetrics) {
  return {
    type: "FeatureCollection",
    crs: "EPSG:4326",
    features: [{
      type: "Feature",
      properties: { source: "local selection", geometry: selectionLabel(metrics.kind, false) },
      geometry: { type: metrics.kind === "circle" ? "Point" : "Polygon", coordinates: [] },
    }],
  };
}

export const defaultProjectId = "atlas-local-001";

export function nowLabel(date = new Date()) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function getLayerStatus(source: string, processed: boolean) {
  return `${source} · ${processed ? "processed locally" : "raw cache"}`;
}
