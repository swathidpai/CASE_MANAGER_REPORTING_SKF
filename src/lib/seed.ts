import { Site, Template } from "./types";
import { makeId } from "./id";

export const SITES: Site[] = [
  { id: "acme", name: "ACME" },
  { id: "robin-rigg", name: "Robin Rigg" },
];

export const DEFAULT_SITE_ID = SITES[0].id;

function severities(siteId: string) {
  return [
    { id: makeId("sev"), name: "High Severity", colour: "#ef4444", order: 0 },
    {
      id: makeId("sev"),
      name: "Medium Severity",
      colour: "#f59e0b",
      order: 1,
    },
    { id: makeId("sev"), name: "Low Severity", colour: "#eab308", order: 2 },
  ].map((s) => ({ ...s, id: `${s.id}_${siteId}` }));
}

function now() {
  return new Date().toISOString();
}

export function seedTemplates(siteId: string): Template[] {
  if (siteId === "acme") {
    return [
      {
        id: makeId("tpl"),
        siteId,
        name: "Winch Room Template",
        description: "Supporting text...",
        severities: severities(siteId),
        assets: [
          {
            id: makeId("ast"),
            path: "ACME/Ballast Pump No 1",
            group: "Winch Room Lower",
            name: "Ballast Pump No 1",
            source: "excel",
          },
          {
            id: makeId("ast"),
            path: "ACME/Winch Motor Port",
            group: "Winch Room Lower",
            name: "Winch Motor Port",
            source: "excel",
          },
        ],
        createdAt: now(),
        updatedAt: now(),
        createdBy: "Robin Rigg",
        reportsGeneratedCount: 3,
      },
      {
        id: makeId("tpl"),
        siteId,
        name: "Engine Room Template",
        description: "Supporting text...",
        severities: severities(siteId),
        assets: [
          {
            id: makeId("ast"),
            path: "ACME/Helideck Fire Pump",
            group: "Engine Room 1",
            name: "Helideck Fire Pump",
            source: "excel",
          },
          {
            id: makeId("ast"),
            path: "ACME/Emergency Fire Pump No 1",
            group: "Engine Room 1",
            name: "Emergency Fire Pump No 1",
            source: "excel",
          },
        ],
        createdAt: now(),
        updatedAt: now(),
        createdBy: "Robin Rigg",
        reportsGeneratedCount: 0,
      },
      {
        id: makeId("tpl"),
        siteId,
        name: "Driving AHU Room",
        description: "Supporting text...",
        severities: severities(siteId),
        assets: [],
        createdAt: now(),
        updatedAt: now(),
        createdBy: "Robin Rigg",
        reportsGeneratedCount: 0,
      },
    ];
  }

  return [];
}
