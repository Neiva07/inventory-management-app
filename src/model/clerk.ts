// Clerk API User type (partial, extend as needed)
export interface ClerkUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  email_addresses?: { email_address: string; id: string }[];
  phone_numbers?: { phone_number: string; id: string }[];
  image_url: string;
  profile_image_url: string;
  primary_email_address_id: string;
  primary_phone_number_id: string;
  last_sign_in_at: number; // Unix timestamp in milliseconds
  created_at: number;      // Unix timestamp in milliseconds
  updated_at: number;
  banned: boolean;
  // Add more fields from Clerk API as needed
}


// Calls the secure Electron bridge to fetch Clerk user by user_id
export async function fetchClerkUser(user_id: string): Promise<ClerkUser> {
  if (!window.electron?.fetchClerkUser) {
    console.error('Electron bridge not initialized. Make sure you are running in Electron context.');
    throw new Error('Clerk user fetch not available');
  }
  try {
    return await window.electron.fetchClerkUser(user_id);
  } catch (error) {
    console.error('Error in fetchClerkUser:', error);
    throw error;
  }
}
