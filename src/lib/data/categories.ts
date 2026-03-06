/**
 * Standard category definitions for CartSense.
 *
 * Two-layer model:
 * - Receipt-level: Classifies the entire receipt (e.g. Groceries, Restaurants)
 * - Product-level: Classifies individual line items (food-focused, e.g. Meat, Dairy)
 */

export interface CategoryDefinition {
  slug: string
  name: string
  nameRo: string
  type: "receipt" | "product"
  color: string
  icon: string
}

// ── Receipt-level categories (18) ───────────────────────────────────

export const RECEIPT_CATEGORIES: CategoryDefinition[] = [
  {
    slug: "groceries",
    name: "Groceries",
    nameRo: "Alimente",
    type: "receipt",
    color: "#22C55E",
    icon: "shopping-cart",
  },
  {
    slug: "restaurants",
    name: "Restaurants",
    nameRo: "Restaurante",
    type: "receipt",
    color: "#F97316",
    icon: "utensils",
  },
  {
    slug: "transport",
    name: "Transport",
    nameRo: "Transport",
    type: "receipt",
    color: "#3B82F6",
    icon: "car",
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    nameRo: "Divertisment",
    type: "receipt",
    color: "#A855F7",
    icon: "film",
  },
  {
    slug: "health",
    name: "Health",
    nameRo: "Sănătate",
    type: "receipt",
    color: "#EF4444",
    icon: "heart",
  },
  {
    slug: "utilities",
    name: "Utilities",
    nameRo: "Utilități",
    type: "receipt",
    color: "#EAB308",
    icon: "zap",
  },
  {
    slug: "shopping",
    name: "Shopping",
    nameRo: "Cumpărături",
    type: "receipt",
    color: "#EC4899",
    icon: "shopping-bag",
  },
  {
    slug: "education",
    name: "Education",
    nameRo: "Educație",
    type: "receipt",
    color: "#6366F1",
    icon: "graduation-cap",
  },
  {
    slug: "services",
    name: "Services",
    nameRo: "Servicii",
    type: "receipt",
    color: "#14B8A6",
    icon: "wrench",
  },
  {
    slug: "coffee-bars",
    name: "Coffee & Bars",
    nameRo: "Cafenele și Baruri",
    type: "receipt",
    color: "#92400E",
    icon: "coffee",
  },
  {
    slug: "clothing",
    name: "Clothing",
    nameRo: "Îmbrăcăminte",
    type: "receipt",
    color: "#D946EF",
    icon: "shirt",
  },
  {
    slug: "electronics",
    name: "Electronics",
    nameRo: "Electronice",
    type: "receipt",
    color: "#0EA5E9",
    icon: "monitor",
  },
  {
    slug: "home",
    name: "Home",
    nameRo: "Casă",
    type: "receipt",
    color: "#84CC16",
    icon: "home",
  },
  {
    slug: "subscriptions",
    name: "Subscriptions",
    nameRo: "Abonamente",
    type: "receipt",
    color: "#7C3AED",
    icon: "repeat",
  },
  {
    slug: "fuel",
    name: "Fuel",
    nameRo: "Combustibil",
    type: "receipt",
    color: "#475569",
    icon: "fuel",
  },
  {
    slug: "personal-care",
    name: "Personal Care",
    nameRo: "Îngrijire Personală",
    type: "receipt",
    color: "#F472B6",
    icon: "sparkles",
  },
  {
    slug: "gifts",
    name: "Gifts",
    nameRo: "Cadouri",
    type: "receipt",
    color: "#FB923C",
    icon: "gift",
  },
  {
    slug: "travel",
    name: "Travel",
    nameRo: "Călătorii",
    type: "receipt",
    color: "#06B6D4",
    icon: "plane",
  },
  {
    slug: "receipt-other",
    name: "Other",
    nameRo: "Altele",
    type: "receipt",
    color: "#6B7280",
    icon: "more-horizontal",
  },
]

// ── Product-level categories (20, food-focused) ─────────────────────

export const PRODUCT_CATEGORIES: CategoryDefinition[] = [
  {
    slug: "meat",
    name: "Meat",
    nameRo: "Carne",
    type: "product",
    color: "#DC2626",
    icon: "beef",
  },
  {
    slug: "dairy",
    name: "Dairy",
    nameRo: "Lactate",
    type: "product",
    color: "#FBBF24",
    icon: "milk",
  },
  {
    slug: "bread-bakery",
    name: "Bread & Bakery",
    nameRo: "Pâine și Panificație",
    type: "product",
    color: "#D97706",
    icon: "croissant",
  },
  {
    slug: "fruits-vegetables",
    name: "Fruits & Vegetables",
    nameRo: "Fructe și Legume",
    type: "product",
    color: "#16A34A",
    icon: "apple",
  },
  {
    slug: "sweets-snacks",
    name: "Sweets & Snacks",
    nameRo: "Dulciuri și Gustări",
    type: "product",
    color: "#E879F9",
    icon: "candy",
  },
  {
    slug: "canned-dry-goods",
    name: "Canned & Dry Goods",
    nameRo: "Conserve și Alimente Uscate",
    type: "product",
    color: "#A16207",
    icon: "archive",
  },
  {
    slug: "frozen",
    name: "Frozen",
    nameRo: "Congelate",
    type: "product",
    color: "#38BDF8",
    icon: "snowflake",
  },
  {
    slug: "drinks",
    name: "Drinks",
    nameRo: "Băuturi",
    type: "product",
    color: "#2DD4BF",
    icon: "cup-soda",
  },
  {
    slug: "alcohol",
    name: "Alcohol",
    nameRo: "Alcool",
    type: "product",
    color: "#7C2D12",
    icon: "wine",
  },
  {
    slug: "tobacco",
    name: "Tobacco",
    nameRo: "Tutun",
    type: "product",
    color: "#78716C",
    icon: "cigarette",
  },
  {
    slug: "product-electronics",
    name: "Electronics",
    nameRo: "Electronice",
    type: "product",
    color: "#0284C7",
    icon: "cpu",
  },
  {
    slug: "household",
    name: "Household",
    nameRo: "Casnice",
    type: "product",
    color: "#65A30D",
    icon: "lamp",
  },
  {
    slug: "cleaning",
    name: "Cleaning",
    nameRo: "Curățenie",
    type: "product",
    color: "#0891B2",
    icon: "spray-can",
  },
  {
    slug: "product-personal-care",
    name: "Personal Care",
    nameRo: "Îngrijire Personală",
    type: "product",
    color: "#DB2777",
    icon: "bath",
  },
  {
    slug: "health-pharma",
    name: "Health & Pharma",
    nameRo: "Sănătate și Farmaceutice",
    type: "product",
    color: "#E11D48",
    icon: "pill",
  },
  {
    slug: "pet-supplies",
    name: "Pet Supplies",
    nameRo: "Produse pentru Animale",
    type: "product",
    color: "#EA580C",
    icon: "paw-print",
  },
  {
    slug: "baby",
    name: "Baby",
    nameRo: "Bebeluși",
    type: "product",
    color: "#C084FC",
    icon: "baby",
  },
  {
    slug: "stationery",
    name: "Stationery",
    nameRo: "Papetărie",
    type: "product",
    color: "#4F46E5",
    icon: "pencil",
  },
  {
    slug: "product-clothing",
    name: "Clothing",
    nameRo: "Îmbrăcăminte",
    type: "product",
    color: "#BE185D",
    icon: "shirt",
  },
  {
    slug: "product-other",
    name: "Other",
    nameRo: "Altele",
    type: "product",
    color: "#6B7280",
    icon: "more-horizontal",
  },
]

/** All standard categories combined */
export const ALL_CATEGORIES: CategoryDefinition[] = [
  ...RECEIPT_CATEGORIES,
  ...PRODUCT_CATEGORIES,
]
