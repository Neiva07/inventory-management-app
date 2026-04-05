// NCM (Nomenclatura Comum do Mercosul) Codes
// Common NCM codes for different product categories

export const NCM_CODES = {
  // Electronics
  COMPUTERS: '8471.30.00',    // Notebooks, laptops
  PHONES: '8517.12.00',       // Smartphones
  TVS: '8528.72.00',          // TVs LCD/LED
  
  // Clothing
  SHIRTS: '6104.42.00',       // Shirts, cotton
  PANTS: '6203.43.00',        // Pants, cotton
  SHOES: '6403.59.00',        // Shoes
  
  // Food
  RICE: '1006.30.00',         // Rice
  BEANS: '0713.33.00',        // Beans
  COFFEE: '0901.11.00',       // Coffee
  
  // Beverages
  BEER: '2203.00.00',         // Beer
  SODA: '2202.10.00',         // Sodas
  JUICE: '2009.11.00',        // Orange juice
  
  // Furniture
  CHAIRS: '9401.69.00',       // Chairs
  TABLES: '9403.60.00',       // Tables
  BEDS: '9403.50.00',         // Beds
  
  // Vehicles
  CARS: '8703.23.00',         // Cars
  MOTORCYCLES: '8711.20.00',  // Motorcycles
  
  // Books
  BOOKS: '4901.99.00',        // Books
  
  // Generic
  GENERIC: '0000.00.00',      // Generic product
} as const;

export const NCM_NAMES = {
  '8471.30.00': 'Notebooks, laptops',
  '8517.12.00': 'Smartphones',
  '8528.72.00': 'TVs LCD/LED',
  '6104.42.00': 'Shirts, cotton',
  '6203.43.00': 'Pants, cotton',
  '6403.59.00': 'Shoes',
  '1006.30.00': 'Rice',
  '0713.33.00': 'Beans',
  '0901.11.00': 'Coffee',
  '2203.00.00': 'Beer',
  '2202.10.00': 'Sodas',
  '2009.11.00': 'Orange juice',
  '9401.69.00': 'Chairs',
  '9403.60.00': 'Tables',
  '9403.50.00': 'Beds',
  '8703.23.00': 'Cars',
  '8711.20.00': 'Motorcycles',
  '4901.99.00': 'Books',
  '0000.00.00': 'Generic product',
} as const; 