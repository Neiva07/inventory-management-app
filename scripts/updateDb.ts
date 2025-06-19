import { collection, getDocs, updateDoc, doc, DocumentData, DocumentReference, UpdateData, FieldValue } from "firebase/firestore";
import { db } from "./firebase";
import { ProductCategory } from "../src/model/productCategories";
import { Unit } from "../src/model/units";
import { Product } from "../src/model/products";
import { Customer } from "../src/model/customer";
import { Supplier } from "../src/model/suppliers";
import { Order } from "../src/model/orders";
import { generatePublicId } from "../src/lib/publicId";
import { CollectionName, COLLECTION_NAMES } from "../src/model";

interface ResourceConfig<T extends DocumentData> {
  collectionName: CollectionName;
  updateFn: (doc: T) => Promise<UpdateData<T> | null>;
  filterFn?: (doc: T) => boolean;
}

async function updateResource<T extends DocumentData>(config: ResourceConfig<T>) {
  console.log(`Starting update for collection: ${config.collectionName}`);
  
  try {
    const collectionRef = collection(db, config.collectionName);
    const snapshot = await getDocs(collectionRef);
    
    console.log(`Found ${snapshot.size} documents in ${config.collectionName}`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data() as T;
      
      // Skip if filter function exists and returns false
      if (config.filterFn && !config.filterFn(data)) {
        skippedCount++;
        continue;
      }
      
      const updates = await config.updateFn(data);
      
      if (updates) {
        const docRef = doc(db, config.collectionName, docSnapshot.id) as DocumentReference<T>;
        await updateDoc(docRef, updates);
        updatedCount++;
        console.log(`Updated document ${docSnapshot.id} in ${config.collectionName}`);
      }
    }
    
    console.log(`Update completed for ${config.collectionName}:`);
    console.log(`- Updated: ${updatedCount} documents`);
    console.log(`- Skipped: ${skippedCount} documents`);
    
  } catch (error) {
    console.error(`Error updating ${config.collectionName}:`, error);
    throw error;
  }
}

// Update product categories with public IDs
async function updateProductCategories() {
  await updateResource<ProductCategory>({
    collectionName: COLLECTION_NAMES.PRODUCT_CATEGORIES,
    updateFn: async (doc) => {
      // Only update if publicId doesn't exist
      if (!doc.publicId) {
        const publicId = await generatePublicId(COLLECTION_NAMES.PRODUCT_CATEGORIES);
        return {
          publicId
        } as UpdateData<ProductCategory>;
      }
      return null;
    }
  });
}

// Update units with public IDs
async function updateUnits() {
  await updateResource<Unit>({
    collectionName: COLLECTION_NAMES.UNITS,
    updateFn: async (doc) => {
      // Only update if publicId doesn't exist
      if (!doc.publicId) {
        const publicId = await generatePublicId(COLLECTION_NAMES.UNITS);
        return {
          publicId
        } as UpdateData<Unit>;
      }
      return null;
    }
  });
}

// Update products with public IDs
async function updateProducts() {
  await updateResource<Product>({
    collectionName: COLLECTION_NAMES.PRODUCTS,
    updateFn: async (doc) => {
      // Only update if publicId doesn't exist
      if (!doc.publicId) {
        const publicId = await generatePublicId(COLLECTION_NAMES.PRODUCTS);
        return {
          publicId
        } as UpdateData<Product>;
      }
      return null;
    }
  });
}

// Update customers with public IDs
async function updateCustomers() {
  await updateResource<Customer>({
    collectionName: COLLECTION_NAMES.CUSTOMERS,
    updateFn: async (doc) => {
      // Only update if publicId doesn't exist
      if (!doc.publicId) {
        const publicId = await generatePublicId(COLLECTION_NAMES.CUSTOMERS);
        return {
          publicId
        } as UpdateData<Customer>;
      }
      return null;
    }
  });
}

// Update suppliers with public IDs
async function updateSuppliers() {
  await updateResource<Supplier>({
    collectionName: COLLECTION_NAMES.SUPPLIERS,
    updateFn: async (doc) => {
      // Only update if publicId doesn't exist
      if (!doc.publicId) {
        const publicId = await generatePublicId(COLLECTION_NAMES.SUPPLIERS);
        return {
          publicId
        } as UpdateData<Supplier>;
      }
      return null;
    }
  });
}

// Update orders with public IDs
async function updateOrders() {
  await updateResource<Order>({
    collectionName: COLLECTION_NAMES.ORDERS,
    updateFn: async (doc) => {
      // Only update if publicId doesn't exist
      if (!doc.publicId) {
        const publicId = await generatePublicId(COLLECTION_NAMES.ORDERS);
        return {
          publicId
        } as UpdateData<Order>;
      }
      return null;
    }
  });
}

// Main function to run all updates
async function main() {
  try {
    console.log("Starting database updates to add public IDs...");
    
    await updateProductCategories();
    await updateUnits();
    await updateProducts();
    await updateCustomers();
    await updateSuppliers();
    await updateOrders();
    
    console.log("All public ID updates completed successfully!");
  } catch (error) {
    console.error("Error during updates:", error);
    process.exit(1);
  }
}

// Run the script
main(); 