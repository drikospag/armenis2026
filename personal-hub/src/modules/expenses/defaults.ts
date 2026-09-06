import type { Category } from './types'

/**
 * Προεπιλεγμένες κατηγορίες. Ο χρήστης μπορεί να τις μετονομάσει, να τις κρύψει
 * ή να προσθέσει δικές του από τις Ρυθμίσεις του module.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  // Επαγγελματικά
  { id: 'b-travel',    name: 'Μετακινήσεις & καύσιμα',   scope: 'business', colorIndex: 0, icon: 'trend',     builtIn: true },
  { id: 'b-hotel',     name: 'Διαμονή',                  scope: 'business', colorIndex: 2, icon: 'home',      builtIn: true },
  { id: 'b-meals',     name: 'Γεύματα & φιλοξενία',      scope: 'business', colorIndex: 3, icon: 'tag',       builtIn: true },
  { id: 'b-equipment', name: 'Εξοπλισμός',               scope: 'business', colorIndex: 6, icon: 'grid',      builtIn: true },
  { id: 'b-software',  name: 'Λογισμικό & συνδρομές',    scope: 'business', colorIndex: 4, icon: 'sparkles',  builtIn: true },
  { id: 'b-telecom',   name: 'Τηλεπικοινωνίες',          scope: 'business', colorIndex: 5, icon: 'info',      builtIn: true },
  { id: 'b-services',  name: 'Επαγγελματικές υπηρεσίες', scope: 'business', colorIndex: 7, icon: 'briefcase', builtIn: true },
  { id: 'b-office',    name: 'Γραφική ύλη & αναλώσιμα',  scope: 'business', colorIndex: 1, icon: 'list',      builtIn: true },
  { id: 'b-training',  name: 'Εκπαίδευση & σεμινάρια',   scope: 'business', colorIndex: 6, icon: 'play',      builtIn: true },
  { id: 'b-insurance', name: 'Ασφάλιση & εισφορές',      scope: 'business', colorIndex: 2, icon: 'lock',      builtIn: true },
  { id: 'b-other',     name: 'Λοιπά επαγγελματικά',      scope: 'business', colorIndex: 5, icon: 'info',      builtIn: true },

  // Προσωπικά
  { id: 'p-market',    name: 'Σούπερ μάρκετ',            scope: 'personal', colorIndex: 1, icon: 'wallet',    builtIn: true },
  { id: 'p-eatout',    name: 'Εστιατόρια & καφέ',        scope: 'personal', colorIndex: 3, icon: 'tag',       builtIn: true },
  { id: 'p-transport', name: 'Μεταφορές',                scope: 'personal', colorIndex: 0, icon: 'trend',     builtIn: true },
  { id: 'p-housing',   name: 'Στέγαση',                  scope: 'personal', colorIndex: 6, icon: 'home',      builtIn: true },
  { id: 'p-bills',     name: 'Λογαριασμοί & ΔΕΚΟ',       scope: 'personal', colorIndex: 4, icon: 'receipt',   builtIn: true },
  { id: 'p-health',    name: 'Υγεία',                    scope: 'personal', colorIndex: 2, icon: 'plus',      builtIn: true },
  { id: 'p-clothes',   name: 'Ένδυση & υπόδηση',         scope: 'personal', colorIndex: 5, icon: 'tag',       builtIn: true },
  { id: 'p-fun',       name: 'Ψυχαγωγία',                scope: 'personal', colorIndex: 7, icon: 'sparkles',  builtIn: true },
  { id: 'p-kids',      name: 'Παιδιά & σχολείο',         scope: 'personal', colorIndex: 4, icon: 'home',      builtIn: true },
  { id: 'p-travel',    name: 'Ταξίδια & διακοπές',       scope: 'personal', colorIndex: 2, icon: 'play',      builtIn: true },
  { id: 'p-subs',      name: 'Συνδρομές',                scope: 'personal', colorIndex: 3, icon: 'repeat',    builtIn: true },
  { id: 'p-other',     name: 'Λοιπά προσωπικά',          scope: 'personal', colorIndex: 5, icon: 'info',      builtIn: true },
]
