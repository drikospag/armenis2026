# Πρότυπο module

Αντίγραψε αυτόν τον φάκελο για να φτιάξεις καινούργιο module:

```bash
cp -r src/modules/_template src/modules/notes
```

1. Άλλαξε το `id`, `name`, `description`, `icon` στο `index.ts`.
2. Γράψε τη σελίδα σου στο `Page.tsx`.
3. Δήλωσέ το στο `src/core/registry.ts`:

```ts
import { notesModule } from '../modules/notes'

export const MODULES: AppModule[] = [dashboardModule, expensesModule, notesModule]
```

Το URL (`#/notes`), η γραμμή πλοήγησης και η κάρτα στην αρχική προκύπτουν αυτόματα.

## Αν το module χρειάζεται δικά του δεδομένα

Πρόσθεσε store στο `SCHEMA` του `src/core/db.ts` και ανέβασε το `DB_VERSION`.
Μετά χρησιμοποίησε τα `dbGetAll`, `dbPut`, `dbDelete` — δες το
`src/modules/expenses/store.tsx` ως πλήρες παράδειγμα (provider + CRUD).

## Εικονίδια

Τα διαθέσιμα ονόματα είναι τα κλειδιά του `PATHS` στο `src/ui/Icon.tsx`.
Πρόσθεσε καινούργιο εικονίδιο βάζοντας ένα ακόμη `path` (24×24, stroke).
