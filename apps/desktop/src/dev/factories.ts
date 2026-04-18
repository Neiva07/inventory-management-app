/**
 * Low-level random generators for dev tooling.
 *
 * Brazilian-context curated arrays + simple templated fallbacks. Not meant
 * to be statistically realistic or pass document-validation algorithms —
 * just plausible enough to populate forms and seed test data.
 */

const FIRST_NAMES = [
  "João", "Pedro", "Lucas", "Miguel", "Gabriel", "Rafael", "Carlos", "André",
  "Bruno", "Felipe", "Gustavo", "Thiago", "Ricardo", "Marcos", "Paulo",
  "Maria", "Ana", "Júlia", "Camila", "Beatriz", "Larissa", "Fernanda",
  "Patrícia", "Aline", "Carolina", "Isabela", "Mariana", "Renata", "Bianca",
];

const LAST_NAMES = [
  "Silva", "Souza", "Oliveira", "Santos", "Pereira", "Lima", "Carvalho",
  "Rodrigues", "Almeida", "Ferreira", "Ribeiro", "Gomes", "Martins", "Araújo",
  "Barbosa", "Costa", "Nunes", "Cardoso", "Rocha", "Mendes", "Moreira",
];

const COMPANY_PREFIXES = [
  "Comercial", "Distribuidora", "Mercantil", "Indústria", "Atacado",
  "Armazém", "Casa", "Empório", "Supermercado", "Depósito",
];

const COMPANY_SUFFIXES = ["LTDA", "ME", "EPP", "Eireli"];

const STREET_NAMES = [
  "Rua das Flores", "Avenida Brasil", "Rua XV de Novembro", "Avenida Paulista",
  "Rua Sete de Setembro", "Avenida Getúlio Vargas", "Rua do Comércio",
  "Avenida Presidente Vargas", "Rua São João", "Avenida Amazonas",
  "Rua das Palmeiras", "Avenida Independência",
];

const PRODUCT_BASES = [
  "Arroz Branco 5kg", "Feijão Carioca 1kg", "Açúcar Refinado 1kg",
  "Óleo de Soja 900ml", "Café Torrado 500g", "Farinha de Trigo 1kg",
  "Macarrão Espaguete 500g", "Leite Integral 1L", "Sal Refinado 1kg",
  "Molho de Tomate 340g", "Extrato de Tomate 340g", "Biscoito Recheado 130g",
  "Pão Francês 1kg", "Manteiga 200g", "Margarina 500g", "Queijo Mussarela 500g",
  "Presunto Fatiado 200g", "Refrigerante 2L", "Suco de Laranja 1L",
  "Água Mineral 500ml", "Detergente 500ml", "Sabão em Pó 1kg",
  "Amaciante 2L", "Papel Higiênico 12un", "Desinfetante 2L",
];

const PRODUCT_CATEGORY_SAMPLES = [
  "Mercearia", "Bebidas", "Limpeza", "Higiene", "Laticínios",
  "Padaria", "Hortifruti", "Açougue", "Congelados", "Doces",
];

const DDD_CODES = [11, 21, 31, 41, 51, 61, 71, 81, 85, 91, 92, 94];

export const rand = (max: number): number => Math.floor(Math.random() * max);

export const randInt = (min: number, max: number): number => min + rand(max - min + 1);

export const pickOne = <T>(arr: readonly T[]): T => arr[rand(arr.length)];

export const pickSome = <T>(arr: readonly T[], n: number): T[] => {
  const copy = [...arr];
  const result: T[] = [];
  const target = Math.min(n, copy.length);
  for (let i = 0; i < target; i++) {
    result.push(copy.splice(rand(copy.length), 1)[0]);
  }
  return result;
};

export const randomPersonName = (): string =>
  `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)} ${pickOne(LAST_NAMES)}`;

export const randomCompanyName = (): string =>
  `${pickOne(COMPANY_PREFIXES)} ${pickOne(LAST_NAMES)} ${pickOne(COMPANY_SUFFIXES)}`;

export const randomLegalName = (): string =>
  `${pickOne(LAST_NAMES)} & ${pickOne(LAST_NAMES)} ${pickOne(COMPANY_SUFFIXES)}`;

export const randomProductTitle = (): string => `${pickOne(PRODUCT_BASES)} #${rand(10000)}`;

export const randomProductCategoryName = (): string => pickOne(PRODUCT_CATEGORY_SAMPLES);

export const randomDigits = (n: number): string =>
  Array.from({ length: n }, () => rand(10)).join("");

/** 11 random digits — not a valid CPF, just the right shape for dev. */
export const randomCPF = (): string => randomDigits(11);

/** 14 random digits — not a valid CNPJ, just the right shape for dev. */
export const randomCNPJ = (): string => randomDigits(14);

/** 7 random digits. */
export const randomRG = (): string => randomDigits(7);

/** 11-digit mobile phone (DDD + 9-digit number). */
export const randomPhone = (): string => `${pickOne(DDD_CODES)}9${randomDigits(8)}`;

/** 10-digit landline phone. */
export const randomLandlinePhone = (): string => `${pickOne(DDD_CODES)}${randomDigits(8)}`;

/** 8-digit postal code. */
export const randomCEP = (): string => randomDigits(8);

export const formatCEP = (eightDigits: string): string =>
  eightDigits.replace(/^(\d{5})(\d{3})$/, "$1-$2");

export const formatPhoneBR = (digits: string): string => {
  if (digits.length === 11) return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  if (digits.length === 10) return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return digits;
};

export const formatCNPJ = (fourteenDigits: string): string =>
  fourteenDigits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

export const randomStreet = (): string =>
  `${pickOne(STREET_NAMES)}, ${randInt(1, 9999)}`;

export const randomEmail = (base?: string): string => {
  const source = (base ?? randomPersonName())
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${source}${rand(1000)}@exemplo.com`;
};

/** Random unix timestamp offset from now, in days. Negative = past, positive = future. */
export const randomDateOffset = (minDays: number, maxDays: number): number =>
  Date.now() + randInt(minDays, maxDays) * 24 * 60 * 60 * 1000;
