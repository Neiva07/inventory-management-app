import { collection, getDocs, updateDoc, doc, DocumentData, DocumentReference, UpdateData, FieldValue } from "firebase/firestore";
import { db } from "./firebase";
import { ProductCategory } from "../src/model/productCategories";
import { Unit } from "../src/model/units";

interface ResourceConfig<T extends DocumentData> {
  collectionName: string;
  updateFn: (doc: T) => UpdateData<T> | null;
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
      
      const updates = config.updateFn(data);
      
      if (updates) {
        const docRef = doc(db, config.collectionName, docSnapshot.id) as DocumentReference<T>;
        await updateDoc(docRef, updates);
        updatedCount++;
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

// Example usage for updating product categories
async function updateProductCategories() {
  await updateResource<ProductCategory>({
    collectionName: "product_categories",
    updateFn: (doc) => {
      // Only update if deleted field doesn't exist
      if (!doc.deleted) {
        return {
          deleted: {
            isDeleted: false,
          }
        } as UpdateData<ProductCategory>;
      }
      return null;
    }
  });
}

// Example usage for updating units
async function updateUnits() {
  await updateResource<Unit>({
    collectionName: "units",
    updateFn: (doc) => {
      // Only update if deleted field doesn't exist
      if (!doc.deleted) {
        return {
          deleted: {
            isDeleted: false,
          }
        } as UpdateData<Unit>;
      }
      return null;
    }
  });
}

// Main function to run all updates
async function main() {
  try {
    console.log("Starting database updates...");
    
    await updateProductCategories();
    await updateUnits();
    
    console.log("All updates completed successfully!");
  } catch (error) {
    console.error("Error during updates:", error);
    process.exit(1);
  }
}

// Run the script
main(); 