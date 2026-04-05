import { CollectionName } from "../model";
import { eq } from "drizzle-orm";
import { createAppDb } from "../db/client";
import {
  customers,
  inboundOrders,
  installmentPayments,
  invitationCodes,
  joinRequests,
  onboardingSessions,
  orders,
  organizations,
  productCategories,
  products,
  supplierBills,
  suppliers,
  units,
  userMemberships,
} from "../db/schema";

/**
 * Generates a unique public ID in the format: {resourceType}-{date}-{randomString}
 * - resourceType: 4 characters (e.g., "prod" for products)
 * - date: 6 characters (YYMMDD format)
 * - randomString: 8 characters
 * 
 * The function checks for uniqueness by querying the specified collection.
 */
export async function generatePublicId(collectionName: CollectionName): Promise<string> {
  // Map collection names to resource types to avoid conflicts
  const resourceTypeMap: { [key in CollectionName]: string } = {
    'products': 'prod',
    'product_categories': 'pcat',
    'customers': 'cust',
    'suppliers': 'supp',
    'orders': 'ordr',
    'units': 'unit',
    'inbound_orders': 'iord',
    'supplier_bills': 'supb',
    'installment_payments': 'inst',
    'organizations': 'orgs',
    'user_memberships': 'userm',
    'onboarding_sessions': 'onbs',
    'invitation_codes': 'invc',
    'join_requests': 'joinr',
  };
  
  const resourceType = resourceTypeMap[collectionName] ?? collectionName.slice(0, 4).padEnd(4, ' ');
  
  // Generate date in YYMMDD format
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month (01-12)
  const day = now.getDate().toString().padStart(2, '0'); // Day (01-31)
  const date = `${year}${month}${day}`;
  
  // Generate random 8-character string (alphanumeric)
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const randomString = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    
    const publicId = `${resourceType}-${date}-${randomString}`;

    const existsLocally = await checkPublicIdExistsLocal(collectionName, publicId);
    if (!existsLocally) {
      return publicId; // ID is unique, return it
    }
    
    attempts++;
  }
  
  // If we've tried too many times, throw an error
  throw new Error(`Unable to generate unique public ID for collection: ${collectionName}`);
}

const checkPublicIdExistsLocal = async (collectionName: CollectionName, publicId: string): Promise<boolean> => {
  const localDb = createAppDb();

  switch (collectionName) {
    case "products": {
      const rows = await localDb.select({ id: products.id }).from(products).where(eq(products.publicId, publicId)).limit(1);
      return rows.length > 0;
    }
    case "product_categories": {
      const rows = await localDb
        .select({ id: productCategories.id })
        .from(productCategories)
        .where(eq(productCategories.publicId, publicId))
        .limit(1);
      return rows.length > 0;
    }
    case "customers": {
      const rows = await localDb.select({ id: customers.id }).from(customers).where(eq(customers.publicId, publicId)).limit(1);
      return rows.length > 0;
    }
    case "suppliers": {
      const rows = await localDb.select({ id: suppliers.id }).from(suppliers).where(eq(suppliers.publicId, publicId)).limit(1);
      return rows.length > 0;
    }
    case "orders": {
      const rows = await localDb.select({ id: orders.id }).from(orders).where(eq(orders.publicId, publicId)).limit(1);
      return rows.length > 0;
    }
    case "units": {
      const rows = await localDb.select({ id: units.id }).from(units).where(eq(units.publicId, publicId)).limit(1);
      return rows.length > 0;
    }
    case "inbound_orders": {
      const rows = await localDb
        .select({ id: inboundOrders.id })
        .from(inboundOrders)
        .where(eq(inboundOrders.publicId, publicId))
        .limit(1);
      return rows.length > 0;
    }
    case "supplier_bills": {
      const rows = await localDb
        .select({ id: supplierBills.id })
        .from(supplierBills)
        .where(eq(supplierBills.publicId, publicId))
        .limit(1);
      return rows.length > 0;
    }
    case "installment_payments": {
      const rows = await localDb
        .select({ id: installmentPayments.id })
        .from(installmentPayments)
        .where(eq(installmentPayments.publicId, publicId))
        .limit(1);
      return rows.length > 0;
    }
    case "organizations": {
      const rows = await localDb
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.id, publicId))
        .limit(1);
      return rows.length > 0;
    }
    case "user_memberships": {
      const rows = await localDb
        .select({ id: userMemberships.id })
        .from(userMemberships)
        .where(eq(userMemberships.id, publicId))
        .limit(1);
      return rows.length > 0;
    }
    case "onboarding_sessions": {
      const rows = await localDb
        .select({ id: onboardingSessions.id })
        .from(onboardingSessions)
        .where(eq(onboardingSessions.id, publicId))
        .limit(1);
      return rows.length > 0;
    }
    case "invitation_codes": {
      const rows = await localDb
        .select({ id: invitationCodes.id })
        .from(invitationCodes)
        .where(eq(invitationCodes.code, publicId))
        .limit(1);
      return rows.length > 0;
    }
    case "join_requests": {
      const rows = await localDb
        .select({ id: joinRequests.id })
        .from(joinRequests)
        .where(eq(joinRequests.id, publicId))
        .limit(1);
      return rows.length > 0;
    }
    default:
      throw new Error(`Unsupported collection for local public ID validation: ${collectionName}`);
  }
};

/**
 * Example usage:
 * generatePublicId('products') // Returns: "prod-250619-fueho39g"
 * generatePublicId('product_categories') // Returns: "pcat-250619-a1b2c3d4"
 * generatePublicId('customers') // Returns: "cust-250619-x9y8z7w6"
 * generatePublicId('suppliers') // Returns: "supp-250619-m5n6o7p8"
 * generatePublicId('orders') // Returns: "ordr-250619-q9r0s1t2"
 * generatePublicId('units') // Returns: "unit-250619-u3v4w5x6"
 * generatePublicId('inbound_orders') // Returns: "iord-250619-a1b2c3d4"
 * generatePublicId('supplier_bills') // Returns: "supb-250619-e5f6g7h8"
 * generatePublicId('installment_payments') // Returns: "inst-250619-i9j0k1l2"
 */
