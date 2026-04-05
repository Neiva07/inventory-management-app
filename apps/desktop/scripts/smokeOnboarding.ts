import dotenv from "dotenv";
import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "./firebase";
import {
  completeOnboardingSession,
  createOnboardingSession,
  deleteOnboardingSession,
  getActiveOnboardingSession,
  updateOnboardingData,
} from "../src/model/organizationOnboardingSession";
import { createOrganization, deleteOrganization, getOrganization } from "../src/model/organization";
import { createUserMembership, deleteUserMembership, getUserMembership } from "../src/model/userMembership";
import { persistOnboardingTeamInvitations, seedOnboardingSampleData } from "../src/model/onboardingSetup";

dotenv.config();

const sanitizeKey = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, "_");

const buildSeedIds = (userID: string) => {
  const key = sanitizeKey(userID).slice(0, 20);
  return {
    units: [`sample_unit_un_${key}`, `sample_unit_box_${key}`],
    categories: [`sample_category_food_${key}`, `sample_category_beverage_${key}`],
    suppliers: [`sample_supplier_one_${key}`, `sample_supplier_two_${key}`],
    customers: [
      `sample_customer_one_${key}`,
      `sample_customer_two_${key}`,
      `sample_customer_three_${key}`,
    ],
    products: [
      `sample_product_rice_${key}`,
      `sample_product_beans_${key}`,
      `sample_product_soda_${key}`,
    ],
  };
};

const buildInvitationDocId = (organizationId: string, email: string): string =>
  `onb_${sanitizeKey(organizationId).slice(0, 20)}_${sanitizeKey(email).slice(0, 20)}`;

const assertCondition = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const deleteIfExists = async (collectionName: string, id: string): Promise<void> => {
  const ref = doc(db, collectionName, id);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    await deleteDoc(ref);
  }
};

async function main(): Promise<void> {
  const runId = Date.now();
  const userID = `smoke_onboarding_${runId}`;

  const inviteEmails = [
    `ops_${runId}@example.test`,
    `manager_${runId}@example.test`,
    `ops_${runId}@example.test`,
  ];

  const invites = [
    { email: inviteEmails[0], name: "Operador Smoke", role: "operator" },
    { email: inviteEmails[1], name: "Gestor Smoke", role: "manager" },
    { email: inviteEmails[2], name: "Operador Duplicado", role: "operator" },
  ];

  let onboardingSessionId: string | null = null;
  let organizationId: string | null = null;
  let membershipId: string | null = null;

  console.log(`Starting onboarding smoke run: ${runId}`);

  try {
    const session = await createOnboardingSession(userID);
    onboardingSessionId = session.id;

    await updateOnboardingData(session.id, {
      organization: {
        name: `Smoke Org ${runId}`,
        domain: "smoke.example.test",
        address: "Rua Teste, 100",
        city: "São Paulo",
        state: "São Paulo",
        zipCode: "01000-000",
        organizationPhoneNumber: "(11) 99999-0000",
        organizationEmail: `org_${runId}@example.test`,
        pocName: "POC Smoke",
        pocRole: "Manager",
        pocPhoneNumber: "(11) 98888-0000",
        pocEmail: `poc_${runId}@example.test`,
      },
      setup: {
        importSampleData: true,
        enableNotifications: false,
        enableAnalytics: false,
      },
      invitations: invites,
    });

    const activeSession = await getActiveOnboardingSession(userID);
    assertCondition(activeSession?.id === session.id, "Active onboarding session not found");

    const org = await createOrganization({
      name: `Smoke Org ${runId}`,
      domain: "smoke.example.test",
      createdBy: userID,
      settings: {
        timezone: "America/Sao_Paulo",
        currency: "BRL",
        language: "pt-BR",
      },
      address: {
        streetAddress: "Rua Teste, 100",
        city: "São Paulo",
        state: "São Paulo",
        zipCode: "01000-000",
        country: "Brazil",
      },
      poc: {
        name: "POC Smoke",
        role: "Manager",
        phoneNumber: "(11) 98888-0000",
        email: `poc_${runId}@example.test`,
      },
      phoneNumber: "(11) 99999-0000",
      email: `org_${runId}@example.test`,
      tax: {
        razaoSocial: "Smoke LTDA",
        cnpj: "12.345.678/0001-99",
        ie: "123.456.789.000",
      },
    });
    organizationId = org.id;

    const membership = await createUserMembership({
      userID,
      organizationId: org.id,
      role: "admin",
    });
    membershipId = membership.id;

    await seedOnboardingSampleData(userID, org.id);
    await persistOnboardingTeamInvitations(org.id, userID, invites);

    await completeOnboardingSession(session.id);

    const orgCheck = await getOrganization(org.id);
    assertCondition(Boolean(orgCheck?.id), "Organization was not persisted");

    const membershipCheck = await getUserMembership(userID, org.id);
    assertCondition(Boolean(membershipCheck?.id), "Membership was not persisted");
    assertCondition(membershipCheck?.role === "admin", "Membership role should be admin");

    const sampleProducts = await getDocs(
      query(
        collection(db, "products"),
        where("userID", "==", userID),
        where("source", "==", "onboarding_sample"),
        limit(10)
      )
    );
    assertCondition(sampleProducts.size >= 3, "Expected at least 3 seeded sample products");

    const sampleCustomers = await getDocs(
      query(
        collection(db, "customers"),
        where("userID", "==", userID),
        where("source", "==", "onboarding_sample"),
        limit(10)
      )
    );
    assertCondition(sampleCustomers.size >= 3, "Expected at least 3 seeded sample customers");

    const onboardingInvites = await getDocs(
      query(
        collection(db, "join_requests"),
        where("organizationId", "==", org.id),
        where("source", "==", "onboarding"),
        limit(10)
      )
    );
    assertCondition(onboardingInvites.size === 2, "Expected 2 deduped onboarding invitations");

    const sessionRef = doc(db, "onboarding_sessions", session.id);
    const completedSession = await getDoc(sessionRef);
    assertCondition(completedSession.exists(), "Onboarding session should exist after completion");
    assertCondition(completedSession.data()?.status === "completed", "Onboarding session should be completed");

    const activeAfterComplete = await getActiveOnboardingSession(userID);
    assertCondition(!activeAfterComplete, "There should be no active onboarding session after completion");

    console.log("Smoke checks passed:");
    console.log(`- organization: ${org.id}`);
    console.log(`- membership: ${membership.id}`);
    console.log(`- sample products: ${sampleProducts.size}`);
    console.log(`- sample customers: ${sampleCustomers.size}`);
    console.log(`- onboarding invites: ${onboardingInvites.size}`);
  } finally {
    const seedIds = buildSeedIds(userID);
    const collectionsToIds: Array<{ collection: string; ids: string[] }> = [
      { collection: "products", ids: seedIds.products },
      { collection: "customers", ids: seedIds.customers },
      { collection: "suppliers", ids: seedIds.suppliers },
      { collection: "product_categories", ids: seedIds.categories },
      { collection: "units", ids: seedIds.units },
      {
        collection: "join_requests",
        ids: Array.from(new Set(inviteEmails.map((email) => buildInvitationDocId(organizationId || "", email)))),
      },
    ];

    for (const item of collectionsToIds) {
      for (const id of item.ids) {
        if (id) {
          await deleteIfExists(item.collection, id);
        }
      }
    }

    if (membershipId) {
      await deleteUserMembership(membershipId);
    }

    if (organizationId) {
      await deleteOrganization(organizationId);
    }

    if (onboardingSessionId) {
      await deleteOnboardingSession(onboardingSessionId);
    }
  }
}

main()
  .then(() => {
    console.log("Onboarding smoke completed successfully.");
  })
  .catch((error) => {
    console.error("Onboarding smoke failed:", error);
    process.exit(1);
  });
