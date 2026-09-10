import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  DocumentData,
  QuerySnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Helper to remove any undefined fields before sending to Firestore
function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        cleaned[key] = cleanForFirestore(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

/**
 * Subscribe in real-time to a subcollection under organizations/{orgId}/{collectionName}
 */
export function subscribeToCollection<T extends { id?: string; uid?: string }>(
  orgId: string,
  collectionName: string,
  onUpdate: (items: T[]) => void,
  onError?: (error: any) => void
): () => void {
  if (!db) {
    console.warn("Firestore db not initialized");
    return () => {};
  }

  try {
    const colRef = collection(db, "organizations", orgId, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
        });
        onUpdate(items);
      },
      (error) => {
        console.warn(`Firestore subscription error on ${collectionName}:`, error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`Failed to create Firestore listener for ${collectionName}:`, err);
    return () => {};
  }
}

/**
 * Create or update a single document in organizations/{orgId}/{collectionName}/{docId}
 */
export async function syncDocument<T extends Record<string, any>>(
  orgId: string,
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  if (!db || !docId) return;

  try {
    const docRef = doc(db, "organizations", orgId, collectionName, docId);
    const cleaned = cleanForFirestore(data);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.warn(`Failed to sync document ${docId} to ${collectionName}:`, err);
    throw err;
  }
}

/**
 * Delete a document from organizations/{orgId}/{collectionName}/{docId}
 */
export async function removeDocument(
  orgId: string,
  collectionName: string,
  docId: string
): Promise<void> {
  if (!db || !docId) return;

  try {
    const docRef = doc(db, "organizations", orgId, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Failed to remove document ${docId} from ${collectionName}:`, err);
    throw err;
  }
}

/**
 * Batch upload a list of items to Firestore
 */
export async function batchUploadCollection<T extends { id?: string; uid?: string }>(
  orgId: string,
  collectionName: string,
  items: T[]
): Promise<number> {
  if (!db || !items || items.length === 0) return 0;

  try {
    let uploadedCount = 0;
    // Process in chunks of 450 (Firestore limit is 500)
    const chunkSize = 450;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      chunk.forEach((item) => {
        const docId = item.id || item.uid;
        if (docId) {
          const docRef = doc(db, "organizations", orgId, collectionName, String(docId));
          batch.set(docRef, cleanForFirestore(item), { merge: true });
          uploadedCount++;
        }
      });

      await batch.commit();
    }
    return uploadedCount;
  } catch (err) {
    console.warn(`Failed batch upload to ${collectionName}:`, err);
    throw err;
  }
}

/**
 * Fetch all items from a collection once
 */
export async function fetchCollection<T>(
  orgId: string,
  collectionName: string
): Promise<T[]> {
  if (!db) return [];

  try {
    const colRef = collection(db, "organizations", orgId, collectionName);
    const snapshot = await getDocs(colRef);
    const items: T[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
    });
    return items;
  } catch (err) {
    console.warn(`Failed to fetch collection ${collectionName}:`, err);
    return [];
  }
}

/**
 * Save unified user passwords dictionary in Firestore organizations/{orgId}/settings/auth
 */
export async function syncAuthCredentials(
  orgId: string,
  passwords: Record<string, string>
): Promise<void> {
  if (!db) return;

  try {
    const docRef = doc(db, "organizations", orgId, "settings", "auth");
    await setDoc(docRef, { passwords, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn("Failed to sync auth credentials to Firestore:", err);
  }
}

/**
 * Real-time subscription to auth credentials in Firestore
 */
export function subscribeToAuthCredentials(
  orgId: string,
  onUpdate: (passwords: Record<string, string>) => void
): () => void {
  if (!db) return () => {};

  try {
    const docRef = doc(db, "organizations", orgId, "settings", "auth");
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.passwords) {
            onUpdate(data.passwords);
          }
        }
      },
      (error) => {
        console.warn("Firestore auth subscription warning:", error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Failed to create Firestore auth listener:", err);
    return () => {};
  }
}
