export type Site = {
  id: string;
  name: string;
};

export type AssetSource = "excel" | "manual";

export type Asset = {
  id: string;
  path: string;
  group: string;
  name: string;
  source: AssetSource;
};

export type Severity = {
  id: string;
  name: string;
  colour: string;
  order: number;
};

export type Template = {
  id: string;
  siteId: string;
  name: string;
  description: string;
  severities: Severity[];
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  /** Number of reports generated from this template (referenced for delete/edit warnings). */
  reportsGeneratedCount: number;
};

export type TemplateDraft = Omit<
  Template,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "reportsGeneratedCount"
>;
