import { eq, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { organizations } from "../db/schema";

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  tax?: {
    razaoSocial?: string;
    cnpj?: string;
    ie?: string;
    im?: string;
    a1Certificate?: string;
  };
  settings: {
    timezone: string;
    currency: string;
    language: string;
    logo?: string;
    acceptedPaymentMethodIds?: string[];
  };
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phoneNumber: string;
  email: string;
  poc: {
    name: string;
    role: string;
    phoneNumber: string;
    email: string;
  };
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface CreateOrganizationData {
  name: string;
  domain?: string;
  createdBy: string;
  settings?: Organization["settings"];
  address: Organization["address"];
  poc: Organization["poc"];
  tax?: Organization["tax"];
  phoneNumber: string;
  email: string;
}

/**
 * The SQLite `organizations` table stores core columns plus a `settings_json` blob.
 * Extended fields `address`, `poc`, `tax` from the Firestore document are not yet persisted
 * and still fall back to defaults until the schema is extended further.
 */

const DEFAULT_SETTINGS: Organization["settings"] = {
  timezone: "America/Sao_Paulo",
  currency: "BRL",
  language: "pt-BR",
};

const parseSettingsJson = (settingsJson: string): Organization["settings"] => {
  try {
    const parsed = JSON.parse(settingsJson) as Partial<Organization["settings"]>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const DEFAULT_ADDRESS: Organization["address"] = {
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
};

const DEFAULT_POC: Organization["poc"] = {
  name: "",
  role: "",
  phoneNumber: "",
  email: "",
};

const mapRow = (row: typeof organizations.$inferSelect): Organization => ({
  id: row.id,
  name: row.name,
  createdBy: row.createdBy,
  settings: parseSettingsJson(row.settingsJson),
  address: DEFAULT_ADDRESS,
  poc: DEFAULT_POC,
  phoneNumber: "",
  email: "",
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const createOrganization = async (data: CreateOrganizationData): Promise<Organization> => {
  const db = createAppDb();
  const organizationId = uuidv4();
  const now = Date.now();
  const mergedSettings: Organization["settings"] = { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) };

  await db.insert(organizations).values({
    id: organizationId,
    name: data.name,
    createdBy: data.createdBy,
    status: "active",
    settingsJson: JSON.stringify(mergedSettings),
    createdAt: now,
    updatedAt: now,
  });

  return {
    ...data,
    id: organizationId,
    settings: mergedSettings,
    address: data.address,
    poc: data.poc,
    createdAt: now,
    updatedAt: now,
  };
};

export const getOrganization = async (orgId: string): Promise<Organization | null> => {
  const db = createAppDb();
  const rows = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  return mapRow(rows[0]);
};

export const updateOrganization = async (
  orgId: string,
  data: Partial<Organization>
): Promise<Organization> => {
  const db = createAppDb();
  const now = Date.now();

  const updates: Partial<typeof organizations.$inferInsert> = {
    updatedAt: now,
  };

  if (data.name !== undefined) {
    updates.name = data.name;
  }

  if (data.settings !== undefined) {
    const existing = await getOrganization(orgId);
    const mergedSettings: Organization["settings"] = {
      ...DEFAULT_SETTINGS,
      ...(existing?.settings ?? {}),
      ...data.settings,
    };
    updates.settingsJson = JSON.stringify(mergedSettings);
  }

  await db
    .update(organizations)
    .set(updates)
    .where(eq(organizations.id, orgId));

  const updatedOrg = await getOrganization(orgId);
  if (!updatedOrg) {
    throw new Error("Organization not found");
  }

  return updatedOrg;
};

export const deleteOrganization = async (orgId: string): Promise<void> => {
  const db = createAppDb();
  await db.delete(organizations).where(eq(organizations.id, orgId));
};

export const getOrganizationsByUser = async (clerkUserId: string): Promise<Organization[]> => {
  const db = createAppDb();
  const rows = await db
    .select()
    .from(organizations)
    .where(eq(organizations.createdBy, clerkUserId));

  return rows.map(mapRow);
};

export const searchOrganizations = async (searchTerm: string): Promise<Organization[]> => {
  const db = createAppDb();
  const rows = await db
    .select()
    .from(organizations)
    .where(like(organizations.name, `${searchTerm}%`));

  return rows.map(mapRow);
};
