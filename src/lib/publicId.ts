import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { CollectionName } from "../model";

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
    
    // Check if this ID already exists in the collection
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where("publicId", "==", publicId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return publicId; // ID is unique, return it
    }
    
    attempts++;
  }
  
  // If we've tried too many times, throw an error
  throw new Error(`Unable to generate unique public ID for collection: ${collectionName}`);
}

/**
 * Example usage:
 * generatePublicId('products') // Returns: "prod-250619-fueho39g"
 * generatePublicId('product_categories') // Returns: "pcat-250619-a1b2c3d4"
 * generatePublicId('customers') // Returns: "cust-250619-x9y8z7w6"
 * generatePublicId('suppliers') // Returns: "supp-250619-m5n6o7p8"
 * generatePublicId('orders') // Returns: "ordr-250619-q9r0s1t2"
 * generatePublicId('units') // Returns: "unit-250619-u3v4w5x6"
 */
