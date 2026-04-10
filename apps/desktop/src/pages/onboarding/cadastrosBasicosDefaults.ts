export interface DefaultUnit {
  name: string;
  description?: string;
}

export interface DefaultCategory {
  name: string;
  description?: string;
}

export const DEFAULT_UNITS: DefaultUnit[] = [
  { name: "Unidade", description: "un" },
  { name: "Caixa", description: "cx" },
  { name: "Pacote", description: "pct" },
  { name: "Quilograma", description: "kg" },
  { name: "Grama", description: "g" },
  { name: "Litro", description: "L" },
  { name: "Mililitro", description: "mL" },
  { name: "Dúzia", description: "dz" },
  { name: "Metro", description: "m" },
];

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "Alimentos" },
  { name: "Bebidas" },
  { name: "Limpeza" },
  { name: "Higiene Pessoal" },
  { name: "Padaria" },
  { name: "Hortifruti" },
  { name: "Laticínios" },
  { name: "Congelados" },
  { name: "Eletrônicos" },
  { name: "Outros" },
];

export const DEFAULT_ACCEPTED_PAYMENT_METHOD_IDS: string[] = [
  "dinheiro",
  "pix",
  "cartao_debito",
  "cartao_credito",
];
