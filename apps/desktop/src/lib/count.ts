import { getCountFromServer, getDocs, query, QueryConstraint, limit } from "firebase/firestore";
import { enableNetwork, disableNetwork } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Get document count with offline fallback
 * When offline, returns the count of documents in the current page
 * When online, uses getCountFromServer for accurate total count
 */
export const getDocumentCount = async (
  collectionRef: any,
  constraints: QueryConstraint[],
  pageSize: number
): Promise<{ count: number; isEstimated: boolean }> => {
  try {
    // Try to get the actual count from server
    const countQuery = query(collectionRef, ...constraints);
    const snapshot = await getCountFromServer(countQuery);
    return { count: snapshot.data().count, isEstimated: false };
  } catch (error) {
    // If getCountFromServer fails (likely offline), fall back to counting current page
    console.warn("getCountFromServer failed, using fallback count:", error);
    
    try {
      // Add limit to get current page documents
      const fallbackConstraints = [...constraints, limit(pageSize)];
      const fallbackQuery = query(collectionRef, ...fallbackConstraints);
      const docsSnapshot = await getDocs(fallbackQuery);
      
      // Return count of documents in current page
      // This is an estimate since we can't get the total count offline
      return { count: docsSnapshot.size, isEstimated: true };
    } catch (fallbackError) {
      console.error("Fallback count also failed:", fallbackError);
      return { count: 0, isEstimated: true };
    }
  }
};

/**
 * Check if Firestore is online
 */
export const isFirestoreOnline = async (): Promise<boolean> => {
  try {
    // Try a simple operation that requires network
    await enableNetwork(db);
    return true;
  } catch {
    return false;
  }
}; 