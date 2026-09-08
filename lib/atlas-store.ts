import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultProjectId, nowLabel } from "@/lib/geometry";

export type Project = {
  id: string;
  name: string;
  region: string;
  crs: string;
  source: string;
  updatedAt: string;
  featureCount: number;
  storage: string;
};

const PROJECTS_KEY = "open-cad-atlas.projects.v1";

export const seedProject: Project = {
  id: defaultProjectId,
  name: "Local workspace / مساحة محلية",
  region: "No extent defined / لم يُحدد امتداد",
  crs: "EPSG:4326",
  source: "OpenStreetMap",
  updatedAt: nowLabel(),
  featureCount: 0,
  storage: "Raw · Processed · Cache · Exports · Logs",
};

export async function loadProjects(): Promise<Project[]> {
  try {
    const raw = await AsyncStorage.getItem(PROJECTS_KEY);
    if (!raw) {
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify([seedProject]));
      return [seedProject];
    }
    const parsed = JSON.parse(raw) as Project[];
    return parsed.length ? parsed : [seedProject];
  } catch {
    return [seedProject];
  }
}

export async function saveProjects(projects: Project[]) {
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export async function createProject(name: string, region: string, crs: string): Promise<Project> {
  const projects = await loadProjects();
  const project: Project = {
    id: `atlas-${Date.now()}`,
    name: name.trim(),
    region,
    crs,
    source: "OpenStreetMap",
    updatedAt: nowLabel(),
    featureCount: 0,
    storage: "Raw · Processed · Cache · Exports · Logs",
  };
  await saveProjects([project, ...projects]);
  return project;
}

export async function savePreference(key: string, value: string) {
  await AsyncStorage.setItem(`open-cad-atlas.preference.${key}`, value);
}

export async function loadPreference(key: string, fallback: string) {
  return (await AsyncStorage.getItem(`open-cad-atlas.preference.${key}`)) ?? fallback;
}
