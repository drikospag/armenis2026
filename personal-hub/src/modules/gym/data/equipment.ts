import type { Equipment, EquipmentCat } from '../types'

/** Ο εξοπλισμός ενός τυπικού γυμναστηρίου. Ο χρήστης ξετσεκάρει όσα δεν έχει το δικό του. */
export const EQUIPMENT: Equipment[] = [
  // Καρδιο
  { id: 'treadmill', name: 'Διάδρομος', cat: 'cardio', desc: 'Περπάτημα σε κλίση, τρέξιμο, διαλειμματικά. Ρυθμίζεις ταχύτητα (km/h) και κλίση (%).' },
  { id: 'bike', name: 'Στατικό ποδήλατο', cat: 'cardio', desc: 'Χαμηλή καταπόνηση στα γόνατα. Ιδανικό για διαλειμματικά και ζέσταμα.' },
  { id: 'elliptical', name: 'Ελλειπτικό', cat: 'cardio', desc: 'Δουλεύει χέρια και πόδια χωρίς κρούση.' },
  { id: 'rower', name: 'Κωπηλατική (Rower)', cat: 'cardio', desc: 'Καρδιο ολόκληρου σώματος. Δύναμη από τα πόδια, όχι από τα χέρια.' },
  { id: 'stairs', name: 'Σκάλα (Stair climber)', cat: 'cardio', desc: 'Έντονο καρδιο με έμφαση σε γλουτούς και γάμπες.' },

  // Μηχανήματα ποδιών
  { id: 'leg_press', name: 'Πρέσα ποδιών (Leg Press)', cat: 'machine', desc: 'Τετρακέφαλοι και γλουτοί χωρίς φόρτιση στη σπονδυλική στήλη.' },
  { id: 'hack_squat', name: 'Hack Squat', cat: 'machine', desc: 'Καθοδηγούμενο κάθισμα με στήριξη πλάτης.' },
  { id: 'leg_ext', name: 'Εκτάσεις ποδιών (Leg Extension)', cat: 'machine', desc: 'Απομόνωση τετρακεφάλων.' },
  { id: 'leg_curl_seated', name: 'Καθιστές κάμψεις (Seated Leg Curl)', cat: 'machine', desc: 'Απομόνωση οπίσθιων μηριαίων, καθιστή θέση.' },
  { id: 'leg_curl_lying', name: 'Πρηνείς κάμψεις (Lying Leg Curl)', cat: 'machine', desc: 'Απομόνωση οπίσθιων μηριαίων, ξαπλωμένος μπρούμυτα.' },
  { id: 'abductor', name: 'Απαγωγοί (Hip Abduction)', cat: 'machine', desc: 'Έξω πλευρά γοφού / μέσος γλουτιαίος.' },
  { id: 'adductor', name: 'Προσαγωγοί (Hip Adduction)', cat: 'machine', desc: 'Εσωτερικοί μηροί.' },
  { id: 'glute_machine', name: 'Μηχάνημα γλουτών (Hip Thrust / Kickback)', cat: 'machine', desc: 'Γλουτοί με σταθερή τροχιά.' },
  { id: 'calf_machine', name: 'Γάμπες (Calf Raise)', cat: 'machine', desc: 'Όρθιο ή καθιστό μηχάνημα για γάμπες.' },

  // Μηχανήματα κορμού
  { id: 'chest_press', name: 'Chest Press', cat: 'machine', desc: 'Πιέσεις στήθους με καθοδηγούμενη τροχιά.' },
  { id: 'pec_deck', name: 'Pec Deck / Butterfly', cat: 'machine', desc: 'Ανοίγματα στήθους· ανάποδα δουλεύει τους οπίσθιους ώμους.' },
  { id: 'shoulder_press_m', name: 'Shoulder Press', cat: 'machine', desc: 'Πιέσεις ώμων καθιστός.' },
  { id: 'lat_pulldown', name: 'Τροχαλία πλάτης (Lat Pulldown)', cat: 'machine', desc: 'Κάθετη έλξη — υποκατάστατο των έλξεων στο μονόζυγο.' },
  { id: 'seated_row', name: 'Καθιστή κωπηλατική τροχαλία (Seated Row)', cat: 'machine', desc: 'Οριζόντια έλξη για πάχος πλάτης.' },
  { id: 'row_machine', name: 'Row με στήριξη στήθους', cat: 'machine', desc: 'Κωπηλατική χωρίς φόρτιση στη μέση.' },
  { id: 'assisted_pullup', name: 'Έλξεις / βυθίσεις με υποβοήθηση', cat: 'machine', desc: 'Αντίβαρο που σε βοηθά να κάνεις έλξεις και βυθίσεις.' },
  { id: 'smith', name: 'Smith Machine', cat: 'machine', desc: 'Μπάρα σε ράγες — πιο ασφαλές χωρίς βοηθό.' },
  { id: 'back_ext', name: 'Πάγκος υπερεκτάσεων (45°)', cat: 'machine', desc: 'Οσφυϊκοί, γλουτοί, οπίσθιοι μηριαίοι.' },
  { id: 'abs_machine', name: 'Μηχάνημα κοιλιακών', cat: 'machine', desc: 'Κοιλιακοί με ρυθμιζόμενη αντίσταση.' },
  { id: 'curl_machine', name: 'Μηχάνημα δικεφάλων (Preacher)', cat: 'machine', desc: 'Κάμψεις δικεφάλων με στήριξη βραχίονα.' },

  // Τροχαλίες
  { id: 'cable', name: 'Διπλή τροχαλία (Cable Crossover)', cat: 'cable', desc: 'Ρυθμιζόμενες τροχαλίες — δεκάδες ασκήσεις για όλο το σώμα.' },

  // Ελεύθερα βάρη & βοηθητικά
  { id: 'dumbbells', name: 'Αλτήρες', cat: 'free', desc: 'Ζεύγη αλτήρων σε διάφορα κιλά.' },
  { id: 'barbell', name: 'Μπάρα Olympic & δίσκοι', cat: 'free', desc: 'Για καθίσματα, πιέσεις, άρσεις.' },
  { id: 'ez_bar', name: 'Μπάρα EZ', cat: 'free', desc: 'Κυρτή μπάρα για δικέφαλους και τρικέφαλους.' },
  { id: 'bench', name: 'Ρυθμιζόμενος πάγκος', cat: 'free', desc: 'Επίπεδος, κεκλιμένος.' },
  { id: 'squat_rack', name: 'Κλουβί / Rack', cat: 'free', desc: 'Στηρίγματα για καθίσματα και πιέσεις με μπάρα.' },
  { id: 'kettlebell', name: 'Kettlebell', cat: 'free', desc: 'Για swings, goblet squat, μεταφορές.' },
  { id: 'pullup_bar', name: 'Μονόζυγο', cat: 'free', desc: 'Έλξεις και ανυψώσεις ποδιών.' },
  { id: 'dip_bars', name: 'Δίζυγο', cat: 'free', desc: 'Βυθίσεις για στήθος και τρικέφαλους.' },
  { id: 'band', name: 'Λάστιχα αντίστασης', cat: 'free', desc: 'Ζέσταμα, ώμοι, γλουτοί.' },
]

export const EQUIPMENT_BY_ID = new Map(EQUIPMENT.map((e) => [e.id, e]))

export const EQUIPMENT_CAT_LABEL: Record<EquipmentCat, string> = {
  cardio: 'Καρδιο',
  machine: 'Μηχανήματα',
  cable: 'Τροχαλίες',
  free: 'Ελεύθερα βάρη & βοηθητικά',
}

export const ALL_EQUIPMENT = EQUIPMENT.map((e) => e.id)

export const EQUIPMENT_PRESETS: { id: string; label: string; ids: string[] }[] = [
  { id: 'full', label: 'Πλήρες γυμναστήριο', ids: ALL_EQUIPMENT },
  {
    id: 'machines',
    label: 'Μόνο μηχανήματα & καρδιο',
    ids: EQUIPMENT.filter((e) => e.cat === 'machine' || e.cat === 'cable' || e.cat === 'cardio').map((e) => e.id),
  },
  { id: 'home', label: 'Σπίτι: αλτήρες, πάγκος, διάδρομος', ids: ['dumbbells', 'bench', 'band', 'treadmill', 'pullup_bar'] },
]
