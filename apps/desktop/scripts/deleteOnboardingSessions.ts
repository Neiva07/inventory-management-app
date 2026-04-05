import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

const ONBOARDING_SESSIONS_COLLECTION = "onboarding_sessions";

async function deleteAllOnboardingSessions() {
  console.log("Starting deletion of all onboarding sessions...");
  
  try {
    const collectionRef = collection(db, ONBOARDING_SESSIONS_COLLECTION);
    const snapshot = await getDocs(collectionRef);
    
    console.log(`Found ${snapshot.size} onboarding sessions to delete`);
    
    if (snapshot.empty) {
      console.log("No onboarding sessions found. Nothing to delete.");
      return;
    }
    
    const BATCH_SIZE = 10;
    const allDocs = snapshot.docs;
    let deletedCount = 0;
    let errorCount = 0;
    let batchNumber = 1;
    
    // Process in batches of 10
    for (let i = 0; i < allDocs.length; i += BATCH_SIZE) {
      const batch = allDocs.slice(i, i + BATCH_SIZE);
      console.log(`\n--- Processing Batch ${batchNumber} (${batch.length} sessions) ---`);
      
      const batchPromises = batch.map(async (docSnapshot) => {
        try {
          const docRef = doc(db, ONBOARDING_SESSIONS_COLLECTION, docSnapshot.id);
          await deleteDoc(docRef);
          return { success: true, id: docSnapshot.id };
        } catch (error) {
          return { success: false, id: docSnapshot.id, error };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Log batch results
      const batchSuccesses = batchResults.filter(result => result.success);
      const batchErrors = batchResults.filter(result => !result.success);
      
      batchSuccesses.forEach(result => {
        console.log(`✅ Deleted: ${result.id}`);
      });
      
      batchErrors.forEach(result => {
        console.error(`❌ Error deleting ${result.id}:`, result.error);
      });
      
      deletedCount += batchSuccesses.length;
      errorCount += batchErrors.length;
      
      console.log(`Batch ${batchNumber} completed: ${batchSuccesses.length} deleted, ${batchErrors.length} errors`);
      batchNumber++;
    }
    
    console.log("\n=== Deletion Summary ===");
    console.log(`Total sessions found: ${snapshot.size}`);
    console.log(`Successfully deleted: ${deletedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total batches processed: ${batchNumber - 1}`);
    
    if (errorCount > 0) {
      console.log("\n⚠️  Some sessions could not be deleted. Check the error messages above.");
    } else {
      console.log("\n✅ All onboarding sessions deleted successfully!");
    }
    
  } catch (error) {
    console.error("Error accessing onboarding sessions collection:", error);
    throw error;
  }
}

async function deleteOnboardingSessionsByStatus(status: 'in_progress' | 'completed') {
  console.log(`Starting deletion of ${status} onboarding sessions...`);
  
  try {
    const collectionRef = collection(db, ONBOARDING_SESSIONS_COLLECTION);
    const snapshot = await getDocs(collectionRef);
    
    const filteredSessions = snapshot.docs.filter(doc => {
      const data = doc.data();
      return data.status === status;
    });
    
    console.log(`Found ${filteredSessions.length} ${status} onboarding sessions to delete`);
    
    if (filteredSessions.length === 0) {
      console.log(`No ${status} onboarding sessions found. Nothing to delete.`);
      return;
    }
    
    const BATCH_SIZE = 10;
    let deletedCount = 0;
    let errorCount = 0;
    let batchNumber = 1;
    
    // Process in batches of 10
    for (let i = 0; i < filteredSessions.length; i += BATCH_SIZE) {
      const batch = filteredSessions.slice(i, i + BATCH_SIZE);
      console.log(`\n--- Processing Batch ${batchNumber} (${batch.length} ${status} sessions) ---`);
      
      const batchPromises = batch.map(async (docSnapshot) => {
        try {
          const docRef = doc(db, ONBOARDING_SESSIONS_COLLECTION, docSnapshot.id);
          await deleteDoc(docRef);
          return { success: true, id: docSnapshot.id };
        } catch (error) {
          return { success: false, id: docSnapshot.id, error };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Log batch results
      const batchSuccesses = batchResults.filter(result => result.success);
      const batchErrors = batchResults.filter(result => !result.success);
      
      batchSuccesses.forEach(result => {
        console.log(`✅ Deleted ${status} session: ${result.id}`);
      });
      
      batchErrors.forEach(result => {
        console.error(`❌ Error deleting ${status} session ${result.id}:`, result.error);
      });
      
      deletedCount += batchSuccesses.length;
      errorCount += batchErrors.length;
      
      console.log(`Batch ${batchNumber} completed: ${batchSuccesses.length} deleted, ${batchErrors.length} errors`);
      batchNumber++;
    }
    
    console.log("\n=== Deletion Summary ===");
    console.log(`Total ${status} sessions found: ${filteredSessions.length}`);
    console.log(`Successfully deleted: ${deletedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total batches processed: ${batchNumber - 1}`);
    
    if (errorCount > 0) {
      console.log(`\n⚠️  Some ${status} sessions could not be deleted. Check the error messages above.`);
    } else {
      console.log(`\n✅ All ${status} onboarding sessions deleted successfully!`);
    }
    
  } catch (error) {
    console.error("Error accessing onboarding sessions collection:", error);
    throw error;
  }
}

async function listOnboardingSessions() {
  console.log("Listing all onboarding sessions...");
  
  try {
    const collectionRef = collection(db, ONBOARDING_SESSIONS_COLLECTION);
    const snapshot = await getDocs(collectionRef);
    
    console.log(`Found ${snapshot.size} onboarding sessions:`);
    
    if (snapshot.empty) {
      console.log("No onboarding sessions found.");
      return;
    }
    
    const sessions = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userID: data.userID,
        status: data.status,
        currentStep: data.currentStep,
        startedAt: new Date(data.startedAt).toLocaleString('pt-BR'),
        lastActivityAt: new Date(data.lastActivityAt).toLocaleString('pt-BR'),
        completedAt: data.completedAt ? new Date(data.completedAt).toLocaleString('pt-BR') : 'N/A'
      };
    });
    
    console.table(sessions);
    
  } catch (error) {
    console.error("Error listing onboarding sessions:", error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'delete-all':
      await deleteAllOnboardingSessions();
      break;
    case 'delete-in-progress':
      await deleteOnboardingSessionsByStatus('in_progress');
      break;
    case 'delete-completed':
      await deleteOnboardingSessionsByStatus('completed');
      break;
    case 'list':
      await listOnboardingSessions();
      break;
    default:
      console.log("Usage: npm run delete-onboarding-sessions <command>");
      console.log("");
      console.log("Commands:");
      console.log("  delete-all         - Delete all onboarding sessions");
      console.log("  delete-in-progress - Delete only in-progress sessions");
      console.log("  delete-completed   - Delete only completed sessions");
      console.log("  list               - List all onboarding sessions");
      console.log("");
      console.log("Examples:");
      console.log("  npm run delete-onboarding-sessions delete-all");
      console.log("  npm run delete-onboarding-sessions delete-in-progress");
      console.log("  npm run delete-onboarding-sessions list");
      break;
  }
}

// Run the script
main().catch(console.error); 