import { doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTION_NAMES } from "./index";
import { UserRole } from "./userMembership";

interface OnboardingInvitation {
  email: string;
  name: string;
  role: string;
}

const JOIN_REQUESTS_COLLECTION = "join_requests";

const sanitizeKey = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "_");

const toCents = (value: number): number => Math.round(value * 100);

const buildPublicId = (prefix: string, userID: string, key: string): string =>
  `${prefix}-${sanitizeKey(userID).slice(0, 8)}-${sanitizeKey(key)}`.slice(0, 40);

const normalizeRole = (role: string): UserRole => {
  if (role === "admin" || role === "manager" || role === "operator" || role === "viewer") {
    return role;
  }
  return "viewer";
};

export const persistOnboardingTeamInvitations = async (
  organizationId: string,
  invitedBy: string,
  invitations: OnboardingInvitation[]
): Promise<void> => {
  const now = Date.now();
  const batch = writeBatch(db);

  const dedupedInvites = Array.from(
    new Map(
      invitations
        .filter((invitation) => invitation.email?.trim())
        .map((invitation) => [invitation.email.trim().toLowerCase(), invitation])
    ).values()
  );

  dedupedInvites.forEach((invitation) => {
    const normalizedEmail = invitation.email.trim().toLowerCase();
    const invitationId =
      `onb_${sanitizeKey(organizationId).slice(0, 20)}_${sanitizeKey(normalizedEmail).slice(0, 20)}`;
    const invitationRef = doc(db, JOIN_REQUESTS_COLLECTION, invitationId);

    batch.set(
      invitationRef,
      {
        id: invitationId,
        organizationId,
        issuedBy: invitedBy,
        userEmail: normalizedEmail,
        invitedName: invitation.name?.trim() || normalizedEmail,
        requestedRole: normalizeRole(invitation.role),
        userMessage: `Convite enviado no onboarding para a função ${normalizeRole(invitation.role)}.`,
        status: "pending",
        requestedAt: now,
        source: "onboarding",
      },
      { merge: true }
    );
  });

  if (dedupedInvites.length > 0) {
    await batch.commit();
  }
};

export const seedOnboardingSampleData = async (
  userID: string,
  organizationId: string
): Promise<void> => {
  const now = Date.now();
  const key = sanitizeKey(userID).slice(0, 20);
  const batch = writeBatch(db);

  const unitUn = {
    id: `sample_unit_un_${key}`,
    name: "Unidade",
    description: "Unidade padrão de venda",
  };
  const unitBox = {
    id: `sample_unit_box_${key}`,
    name: "Caixa",
    description: "Caixa com múltiplas unidades",
  };

  batch.set(doc(db, COLLECTION_NAMES.UNITS, unitUn.id), {
    ...unitUn,
    publicId: buildPublicId("unit", userID, "un"),
    userID,
    organizationId,
    createdAt: now,

    source: "onboarding_sample",
  });
  batch.set(doc(db, COLLECTION_NAMES.UNITS, unitBox.id), {
    ...unitBox,
    publicId: buildPublicId("unit", userID, "box"),
    userID,
    organizationId,
    createdAt: now,

    source: "onboarding_sample",
  });

  const foodCategory = {
    id: `sample_category_food_${key}`,
    name: "Alimentos",
    description: "Produtos alimentícios",
  };
  const beverageCategory = {
    id: `sample_category_beverage_${key}`,
    name: "Bebidas",
    description: "Bebidas e líquidos",
  };

  batch.set(doc(db, COLLECTION_NAMES.PRODUCT_CATEGORIES, foodCategory.id), {
    ...foodCategory,
    publicId: buildPublicId("pcat", userID, "food"),
    userID,
    organizationId,
    createdAt: now,

    source: "onboarding_sample",
  });
  batch.set(doc(db, COLLECTION_NAMES.PRODUCT_CATEGORIES, beverageCategory.id), {
    ...beverageCategory,
    publicId: buildPublicId("pcat", userID, "beverage"),
    userID,
    organizationId,
    createdAt: now,

    source: "onboarding_sample",
  });

  const supplierOne = {
    id: `sample_supplier_one_${key}`,
    tradeName: "Distribuidora Central",
    legalName: "Distribuidora Central LTDA",
  };
  const supplierTwo = {
    id: `sample_supplier_two_${key}`,
    tradeName: "Atacado Norte",
    legalName: "Atacado Norte SA",
  };

  batch.set(doc(db, COLLECTION_NAMES.SUPPLIERS, supplierOne.id), {
    ...supplierOne,
    publicId: buildPublicId("supp", userID, "supplier1"),
    userID,
    organizationId,
    status: "active",
    description: "Fornecedor de exemplo do onboarding",
    productCategories: [{ id: foodCategory.id, name: foodCategory.name }],
    contactName: "João Silva",
    companyPhone: "(11) 98888-0001",
    contactPhone: "(11) 98888-0002",
    createdAt: now,

    source: "onboarding_sample",
  });
  batch.set(doc(db, COLLECTION_NAMES.SUPPLIERS, supplierTwo.id), {
    ...supplierTwo,
    publicId: buildPublicId("supp", userID, "supplier2"),
    userID,
    organizationId,
    status: "active",
    description: "Fornecedor de bebidas de exemplo",
    productCategories: [{ id: beverageCategory.id, name: beverageCategory.name }],
    contactName: "Maria Souza",
    companyPhone: "(21) 97777-0001",
    contactPhone: "(21) 97777-0002",
    createdAt: now,

    source: "onboarding_sample",
  });

  const customers = [
    { id: `sample_customer_one_${key}`, name: "Mercado São José" },
    { id: `sample_customer_two_${key}`, name: "Restaurante Sabor Caseiro" },
    { id: `sample_customer_three_${key}`, name: "Loja da Esquina" },
  ];

  customers.forEach((customer, index) => {
    batch.set(doc(db, COLLECTION_NAMES.CUSTOMERS, customer.id), {
      ...customer,
      publicId: buildPublicId("cust", userID, `customer${index + 1}`),
      userID,
      organizationId,
      status: "active",
      contactName: customer.name,
      companyPhone: "(11) 90000-0000",
      createdAt: now,
  
      source: "onboarding_sample",
    });
  });

  const pixPaymentMethod = { id: "pix", label: "Pix" };
  const cardPaymentMethod = { id: "cartao_credito", label: "Cartão de Crédito" };

  const products = [
    {
      id: `sample_product_rice_${key}`,
      title: "Arroz Branco 5kg",
      description: "Pacote de arroz branco tipo 1",
      category: foodCategory,
      supplier: supplierOne,
      cost: 22.4,
      unitPrice: 29.9,
      inventory: 120,
      minInventory: 20,
      weight: 5,
    },
    {
      id: `sample_product_beans_${key}`,
      title: "Feijão Carioca 1kg",
      description: "Feijão carioca para varejo",
      category: foodCategory,
      supplier: supplierOne,
      cost: 7.2,
      unitPrice: 9.9,
      inventory: 180,
      minInventory: 30,
      weight: 1,
    },
    {
      id: `sample_product_soda_${key}`,
      title: "Refrigerante Cola 2L",
      description: "Garrafa PET 2 litros",
      category: beverageCategory,
      supplier: supplierTwo,
      cost: 4.5,
      unitPrice: 6.9,
      inventory: 240,
      minInventory: 40,
      weight: 2,
    },
  ];

  products.forEach((product, index) => {
    batch.set(doc(db, COLLECTION_NAMES.PRODUCTS, product.id), {
      id: product.id,
      publicId: buildPublicId("prod", userID, `product${index + 1}`),
      userID,
      organizationId,
      title: product.title,
      description: product.description,
      status: "active",
      createdAt: now,
      updatedAt: now,
  
      inventory: product.inventory,
      minInventory: product.minInventory,
      baseUnit: {
        id: unitUn.id,
        name: unitUn.name,
      },
      variants: [
        {
          unit: {
            id: unitUn.id,
            name: unitUn.name,
          },
          conversionRate: 1,
          unitCost: toCents(product.cost),
          prices: [
            {
              paymentMethod: pixPaymentMethod,
              value: toCents(product.unitPrice),
              profit: toCents(product.unitPrice - product.cost),
            },
            {
              paymentMethod: cardPaymentMethod,
              value: toCents(product.unitPrice + 0.5),
              profit: toCents(product.unitPrice + 0.5 - product.cost),
            },
          ],
        },
        {
          unit: {
            id: unitBox.id,
            name: unitBox.name,
          },
          conversionRate: 12,
          unitCost: toCents(product.cost * 12),
          prices: [
            {
              paymentMethod: pixPaymentMethod,
              value: toCents(product.unitPrice * 12),
              profit: toCents((product.unitPrice - product.cost) * 12),
            },
          ],
        },
      ],
      weight: product.weight,
      cost: toCents(product.cost),
      sailsmanComission: toCents(2),
      suppliers: [
        {
          supplierID: product.supplier.id,
          name: product.supplier.tradeName,
          description: "Fornecedor de exemplo",
          status: "active",
        },
      ],
      productCategory: {
        id: product.category.id,
        name: product.category.name,
      },
      source: "onboarding_sample",
    });
  });

  await batch.commit();
};
