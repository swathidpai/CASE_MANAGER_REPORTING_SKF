"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Site, Template, TemplateDraft } from "./types";
import { SITES, DEFAULT_SITE_ID, seedTemplates } from "./seed";
import { makeId } from "./id";

const TEMPLATES_KEY = "windai.templates.v1";
const ACTIVE_SITE_KEY = "windai.activeSite.v1";

type TemplatesBySite = Record<string, Template[]>;

function loadTemplates(): TemplatesBySite {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TEMPLATES_KEY);
    if (raw) return JSON.parse(raw) as TemplatesBySite;
  } catch {
    // corrupt storage — fall through to seeding fresh data
  }
  const seeded: TemplatesBySite = {};
  for (const site of SITES) seeded[site.id] = seedTemplates(site.id);
  try {
    window.localStorage.setItem(TEMPLATES_KEY, JSON.stringify(seeded));
  } catch {
    // ignore — in-memory state still works this session
  }
  return seeded;
}

function persistTemplates(data: TemplatesBySite) {
  try {
    window.localStorage.setItem(TEMPLATES_KEY, JSON.stringify(data));
  } catch {
    // ignore quota / private-mode errors
  }
}

type AppState = {
  ready: boolean;
  sites: Site[];
  activeSiteId: string;
  setActiveSiteId: (id: string) => void;
  templates: Template[];
  getTemplate: (id: string) => Template | undefined;
  isNameTaken: (name: string, excludeId?: string) => boolean;
  createTemplate: (draft: TemplateDraft) => Template;
  updateTemplate: (id: string, draft: TemplateDraft) => Template;
  duplicateTemplate: (id: string) => Template;
  deleteTemplate: (id: string) => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [activeSiteId, setActiveSiteIdState] = useState(DEFAULT_SITE_ID);
  const [templatesBySite, setTemplatesBySite] = useState<TemplatesBySite>({});

  useEffect(() => {
    const loadedTemplates = loadTemplates();
    let loadedSite = DEFAULT_SITE_ID;
    try {
      const storedSite = window.localStorage.getItem(ACTIVE_SITE_KEY);
      if (storedSite && SITES.some((s) => s.id === storedSite)) {
        loadedSite = storedSite;
      }
    } catch {
      // ignore
    }
    setTemplatesBySite(loadedTemplates);
    setActiveSiteIdState(loadedSite);
    setReady(true);
  }, []);

  const setActiveSiteId = useCallback((id: string) => {
    setActiveSiteIdState(id);
    try {
      window.localStorage.setItem(ACTIVE_SITE_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  const templates = useMemo(
    () => templatesBySite[activeSiteId] ?? [],
    [templatesBySite, activeSiteId]
  );

  const mutate = useCallback(
    (siteId: string, updater: (list: Template[]) => Template[]) => {
      setTemplatesBySite((prev) => {
        const next = {
          ...prev,
          [siteId]: updater(prev[siteId] ?? []),
        };
        persistTemplates(next);
        return next;
      });
    },
    []
  );

  const getTemplate = useCallback(
    (id: string) => templates.find((t) => t.id === id),
    [templates]
  );

  const isNameTaken = useCallback(
    (name: string, excludeId?: string) => {
      const trimmed = name.trim().toLowerCase();
      return templates.some(
        (t) => t.id !== excludeId && t.name.trim().toLowerCase() === trimmed
      );
    },
    [templates]
  );

  const createTemplate = useCallback(
    (draft: TemplateDraft) => {
      const nowIso = new Date().toISOString();
      const template: Template = {
        ...draft,
        id: makeId("tpl"),
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: "You",
        reportsGeneratedCount: 0,
      };
      mutate(draft.siteId, (list) => [...list, template]);
      return template;
    },
    [mutate]
  );

  const updateTemplate = useCallback(
    (id: string, draft: TemplateDraft) => {
      let updated: Template | undefined;
      mutate(draft.siteId, (list) =>
        list.map((t) => {
          if (t.id !== id) return t;
          updated = { ...t, ...draft, updatedAt: new Date().toISOString() };
          return updated;
        })
      );
      return updated as Template;
    },
    [mutate]
  );

  const duplicateTemplate = useCallback(
    (id: string) => {
      const source = templates.find((t) => t.id === id);
      if (!source) throw new Error("Template not found");
      const nowIso = new Date().toISOString();
      let base = `${source.name} (Copy)`;
      let attempt = 1;
      while (
        templates.some((t) => t.name.toLowerCase() === base.toLowerCase())
      ) {
        attempt += 1;
        base = `${source.name} (Copy ${attempt})`;
      }
      const clone: Template = {
        ...source,
        id: makeId("tpl"),
        name: base,
        severities: source.severities.map((s) => ({
          ...s,
          id: makeId("sev"),
        })),
        assets: source.assets.map((a) => ({ ...a, id: makeId("ast") })),
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: "You",
        reportsGeneratedCount: 0,
      };
      mutate(source.siteId, (list) => [...list, clone]);
      return clone;
    },
    [templates, mutate]
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      const target = templates.find((t) => t.id === id);
      if (!target) return;
      mutate(target.siteId, (list) => list.filter((t) => t.id !== id));
    },
    [templates, mutate]
  );

  const value = useMemo<AppState>(
    () => ({
      ready,
      sites: SITES,
      activeSiteId,
      setActiveSiteId,
      templates,
      getTemplate,
      isNameTaken,
      createTemplate,
      updateTemplate,
      duplicateTemplate,
      deleteTemplate,
    }),
    [
      ready,
      activeSiteId,
      setActiveSiteId,
      templates,
      getTemplate,
      isNameTaken,
      createTemplate,
      updateTemplate,
      duplicateTemplate,
      deleteTemplate,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
