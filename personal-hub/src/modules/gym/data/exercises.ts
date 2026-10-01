import type { Exercise } from '../types'

/**
 * Η βιβλιοθήκη ασκήσεων. Κάθε άσκηση δηλώνει τι εξοπλισμό θέλει, ποιο κινητικό
 * πρότυπο καλύπτει, από ποιο επίπεδο και πάνω προτείνεται και ποιες αρθρώσεις
 * φορτίζει — από αυτά διαλέγει η γεννήτρια.
 */
export const EXERCISES: Exercise[] = [
  /* ── Καθίσματα ──────────────────────────────────────────────────────── */
  {
    id: 'leg_press', name: 'Πρέσα ποδιών', en: 'Leg Press', eq: ['leg_press'], pattern: 'squat',
    primary: 'quads', secondary: ['glutes'], level: 'beginner', compound: true,
    cues: ['Πέλματα στο πλάτος των ώμων, στη μέση της πλατφόρμας.', 'Κατέβασε μέχρι τις 90° χωρίς να σηκωθεί η λεκάνη.', 'Μην κλειδώνεις τα γόνατα στο πάνω σημείο.'],
  },
  {
    id: 'goblet_squat', name: 'Goblet καθίσματα', en: 'Goblet Squat', eq: ['dumbbells|kettlebell'], pattern: 'squat',
    primary: 'quads', secondary: ['glutes', 'core'], level: 'beginner', compound: true, stress: ['knees'],
    cues: ['Κράτα τον αλτήρα κολλητά στο στήθος.', 'Κάθισε ανάμεσα στις φτέρνες, κορμός όρθιος.', 'Γόνατα στην κατεύθυνση των δακτύλων.'],
  },
  {
    id: 'smith_squat', name: 'Καθίσματα στο Smith', en: 'Smith Machine Squat', eq: ['smith'], pattern: 'squat',
    primary: 'quads', secondary: ['glutes'], level: 'beginner', compound: true, stress: ['knees'],
    cues: ['Πόδια λίγο μπροστά από τη μπάρα.', 'Κατέβα ελεγχόμενα σε 2–3 δευτερόλεπτα.', 'Σφίξε κοιλιά πριν από κάθε επανάληψη.'],
  },
  {
    id: 'hack_squat', name: 'Hack Squat', en: 'Hack Squat', eq: ['hack_squat'], pattern: 'squat',
    primary: 'quads', secondary: ['glutes'], level: 'intermediate', compound: true, stress: ['knees'],
    cues: ['Πλάτη κολλημένη στο μαξιλάρι.', 'Βαθύ κάθισμα όσο επιτρέπει η κινητικότητα.', 'Σπρώξε από όλο το πέλμα.'],
  },
  {
    id: 'back_squat', name: 'Καθίσματα με μπάρα', en: 'Barbell Back Squat', eq: ['barbell', 'squat_rack'], pattern: 'squat',
    primary: 'quads', secondary: ['glutes', 'core'], level: 'intermediate', compound: true, stress: ['knees', 'lowerback'],
    cues: ['Μπάρα στους τραπεζοειδείς, αγκώνες κάτω.', 'Βαθιά ανάσα και σφίξιμο κορμού πριν κατέβεις.', 'Τουλάχιστον μέχρι παράλληλο, ουδέτερη μέση.'],
  },
  {
    id: 'front_squat', name: 'Μπροστινά καθίσματα', en: 'Front Squat', eq: ['barbell', 'squat_rack'], pattern: 'squat',
    primary: 'quads', secondary: ['core', 'glutes'], level: 'advanced', compound: true, stress: ['knees', 'wrists'],
    cues: ['Μπάρα στους πρόσθιους δελτοειδείς, αγκώνες ψηλά.', 'Κορμός πιο κάθετος από το πίσω κάθισμα.', 'Αν πονούν οι καρποί, σταύρωσε τα χέρια.'],
  },
  {
    id: 'bw_squat', name: 'Καθίσματα με το βάρος σώματος', en: 'Air Squat', eq: [], pattern: 'squat',
    primary: 'quads', secondary: ['glutes'], level: 'beginner', compound: true,
    cues: ['Χέρια μπροστά για ισορροπία.', 'Κάθισε πίσω σαν να πας σε καρέκλα.', 'Ελεγχόμενος ρυθμός.'],
  },

  /* ── Άρσεις ισχίου ──────────────────────────────────────────────────── */
  {
    id: 'rdl_db', name: 'Ρουμάνικη άρση με αλτήρες', en: 'Dumbbell RDL', eq: ['dumbbells'], pattern: 'hinge',
    primary: 'hamstrings', secondary: ['glutes', 'back'], level: 'beginner', compound: true, stress: ['lowerback'],
    cues: ['Γόνατα ελαφρώς λυγισμένα και σταθερά.', 'Σπρώξε τη λεκάνη πίσω, αλτήρες κοντά στα πόδια.', 'Κατέβα μέχρι να τεντώσουν οι οπίσθιοι — όχι παραπέρα.'],
  },
  {
    id: 'rdl_bb', name: 'Ρουμάνικη άρση με μπάρα', en: 'Romanian Deadlift', eq: ['barbell'], pattern: 'hinge',
    primary: 'hamstrings', secondary: ['glutes', 'back'], level: 'intermediate', compound: true, stress: ['lowerback'],
    cues: ['Μπάρα «γλιστράει» πάνω στους μηρούς.', 'Ουδέτερη μέση σε όλη τη διαδρομή.', 'Σφίξε γλουτούς στο πάνω σημείο.'],
  },
  {
    id: 'deadlift', name: 'Άρση θανάτου', en: 'Deadlift', eq: ['barbell'], pattern: 'hinge',
    primary: 'back', secondary: ['glutes', 'hamstrings', 'core'], level: 'advanced', compound: true, stress: ['lowerback'],
    cues: ['Μπάρα πάνω από το μέσο του πέλματος.', 'Τέντωσε τη μπάρα πριν τη σηκώσεις («βγάλε τον τζόγο»).', 'Σπρώξε το πάτωμα, μην τραβάς με τη μέση.'],
  },
  {
    id: 'hip_thrust_bb', name: 'Hip thrust με μπάρα', en: 'Barbell Hip Thrust', eq: ['barbell', 'bench'], pattern: 'hinge',
    primary: 'glutes', secondary: ['hamstrings'], level: 'intermediate', compound: true,
    cues: ['Ωμοπλάτες στον πάγκο, μαξιλαράκι στη μπάρα.', 'Σπρώξε από τις φτέρνες.', 'Παύση 1″ πάνω, πηγούνι μέσα.'],
  },
  {
    id: 'hip_thrust_m', name: 'Hip thrust στο μηχάνημα', en: 'Hip Thrust Machine', eq: ['glute_machine'], pattern: 'hinge',
    primary: 'glutes', secondary: ['hamstrings'], level: 'beginner', compound: true,
    cues: ['Πλήρης έκταση ισχίου πάνω.', 'Κοιλιά σφιχτή, μην κάνεις καμάρα.', 'Αργή επιστροφή.'],
  },
  {
    id: 'glute_bridge', name: 'Γέφυρα γλουτών', en: 'Glute Bridge', eq: [], pattern: 'hinge',
    primary: 'glutes', secondary: ['hamstrings'], level: 'beginner', compound: false,
    cues: ['Ξαπλωμένος, πέλματα κοντά στους γλουτούς.', 'Σήκωσε τη λεκάνη σφίγγοντας γλουτούς.', 'Παύση 2″ πάνω.'],
  },
  {
    id: 'back_ext', name: 'Υπερεκτάσεις 45°', en: '45° Back Extension', eq: ['back_ext'], pattern: 'hinge',
    primary: 'glutes', secondary: ['hamstrings', 'back'], level: 'beginner', compound: false, stress: ['lowerback'],
    cues: ['Το μαξιλάρι κάτω από τη λεκάνη.', 'Κίνηση από το ισχίο, όχι από τη μέση.', 'Ανέβα μέχρι ευθεία γραμμή — όχι υπερέκταση.'],
  },
  {
    id: 'kb_swing', name: 'Αιωρήσεις kettlebell', en: 'Kettlebell Swing', eq: ['kettlebell'], pattern: 'hinge',
    primary: 'glutes', secondary: ['hamstrings', 'core'], level: 'intermediate', compound: true, stress: ['lowerback'],
    cues: ['Εκρηκτικό σπρώξιμο ισχίου — όχι κάθισμα.', 'Τα χέρια απλώς καθοδηγούν.', 'Το kettlebell φτάνει ως το ύψος του στήθους.'],
  },
  {
    id: 'cable_pullthrough', name: 'Pull-through στην τροχαλία', en: 'Cable Pull-Through', eq: ['cable'], pattern: 'hinge',
    primary: 'glutes', secondary: ['hamstrings'], level: 'beginner', compound: false,
    cues: ['Πλάτη στην τροχαλία, σχοινί ανάμεσα στα πόδια.', 'Λύγισε από το ισχίο.', 'Σφίξε γλουτούς για να σηκωθείς.'],
  },

  /* ── Προβολές ───────────────────────────────────────────────────────── */
  {
    id: 'db_lunge', name: 'Προβολές περπατώντας με αλτήρες', en: 'Walking Lunges', eq: ['dumbbells'], pattern: 'lunge',
    primary: 'quads', secondary: ['glutes'], level: 'beginner', compound: true, stress: ['knees'],
    cues: ['Μεγάλο βήμα, πίσω γόνατο κοντά στο πάτωμα.', 'Κορμός όρθιος.', 'Επαναλήψεις ανά πόδι.'],
  },
  {
    id: 'reverse_lunge', name: 'Οπίσθιες προβολές', en: 'Reverse Lunge', eq: [], pattern: 'lunge',
    primary: 'quads', secondary: ['glutes'], level: 'beginner', compound: true, stress: ['knees'],
    cues: ['Βήμα προς τα πίσω — πιο φιλικό στα γόνατα από το μπροστινό.', 'Βάρος στη φτέρνα του μπροστινού ποδιού.', 'Πρόσθεσε αλτήρες όταν γίνει εύκολο.'],
  },
  {
    id: 'step_up', name: 'Ανεβάσματα σε πάγκο', en: 'Dumbbell Step-Up', eq: ['dumbbells', 'bench'], pattern: 'lunge',
    primary: 'glutes', secondary: ['quads'], level: 'beginner', compound: true,
    cues: ['Όλο το πέλμα πάνω στον πάγκο.', 'Ανέβα με το πάνω πόδι, μην σπρώχνεις με το κάτω.', 'Κατέβα αργά.'],
  },
  {
    id: 'bulgarian', name: 'Βουλγάρικα καθίσματα', en: 'Bulgarian Split Squat', eq: ['dumbbells', 'bench'], pattern: 'lunge',
    primary: 'quads', secondary: ['glutes'], level: 'intermediate', compound: true, stress: ['knees'],
    cues: ['Πίσω πόδι πάνω στον πάγκο.', 'Κατέβα κάθετα, όχι μπροστά.', 'Ξεκίνα με το πιο αδύναμο πόδι.'],
  },
  {
    id: 'smith_lunge', name: 'Οπίσθιες προβολές στο Smith', en: 'Smith Reverse Lunge', eq: ['smith'], pattern: 'lunge',
    primary: 'glutes', secondary: ['quads'], level: 'intermediate', compound: true, stress: ['knees'],
    cues: ['Η μπάρα δίνει σταθερότητα — δούλεψε φορτίο.', 'Πίσω γόνατο σχεδόν στο πάτωμα.', 'Επαναλήψεις ανά πόδι.'],
  },

  /* ── Απομόνωση ποδιών ───────────────────────────────────────────────── */
  {
    id: 'leg_ext', name: 'Εκτάσεις ποδιών', en: 'Leg Extension', eq: ['leg_ext'], pattern: 'quad_iso',
    primary: 'quads', level: 'beginner', compound: false, stress: ['knees'],
    cues: ['Γόνατο ευθυγραμμισμένο με τον άξονα του μηχανήματος.', 'Παύση 1″ πάνω.', 'Αργή επιστροφή (3″).'],
  },
  {
    id: 'leg_curl_seated', name: 'Καθιστές κάμψεις ποδιών', en: 'Seated Leg Curl', eq: ['leg_curl_seated'], pattern: 'ham_iso',
    primary: 'hamstrings', level: 'beginner', compound: false,
    cues: ['Το πάνω μαξιλάρι κλειδώνει τους μηρούς.', 'Τράβα μέχρι το τέρμα.', 'Μην αφήνεις το βάρος να «πέφτει».'],
  },
  {
    id: 'leg_curl_lying', name: 'Πρηνείς κάμψεις ποδιών', en: 'Lying Leg Curl', eq: ['leg_curl_lying'], pattern: 'ham_iso',
    primary: 'hamstrings', level: 'beginner', compound: false,
    cues: ['Λεκάνη κολλημένη στον πάγκο.', 'Κάμψη χωρίς να σηκώνεις τους γοφούς.', 'Ελεγχόμενη επιστροφή.'],
  },
  {
    id: 'nordic', name: 'Nordic curls', en: 'Nordic Hamstring Curl', eq: [], pattern: 'ham_iso',
    primary: 'hamstrings', level: 'advanced', compound: false, stress: ['knees'],
    cues: ['Αστράγαλοι κλειδωμένοι κάτω από κάτι σταθερό.', 'Πέσε μπροστά όσο αργά μπορείς.', 'Βοήθησε με τα χέρια στην άνοδο.'],
  },
  {
    id: 'abductor', name: 'Απαγωγοί στο μηχάνημα', en: 'Hip Abduction', eq: ['abductor'], pattern: 'glute_iso',
    primary: 'glutes', level: 'beginner', compound: false,
    cues: ['Γείρε λίγο μπροστά για περισσότερο γλουτό.', 'Παύση στο άνοιγμα.', 'Αργό κλείσιμο.'],
  },
  {
    id: 'cable_kickback', name: 'Kickback γλουτών στην τροχαλία', en: 'Cable Glute Kickback', eq: ['cable'], pattern: 'glute_iso',
    primary: 'glutes', level: 'beginner', compound: false,
    cues: ['Περικάρπιο στον αστράγαλο.', 'Κλώτσα πίσω χωρίς καμάρα στη μέση.', 'Επαναλήψεις ανά πόδι.'],
  },
  {
    id: 'band_walk', name: 'Πλάγια βήματα με λάστιχο', en: 'Banded Lateral Walk', eq: ['band'], pattern: 'glute_iso',
    primary: 'glutes', level: 'beginner', compound: false,
    cues: ['Λάστιχο πάνω από τα γόνατα, μισό κάθισμα.', 'Μικρά βήματα, συνεχής ένταση.', 'Επαναλήψεις ανά κατεύθυνση.'],
  },
  {
    id: 'adductor', name: 'Προσαγωγοί στο μηχάνημα', en: 'Hip Adduction', eq: ['adductor'], pattern: 'adductor',
    primary: 'adductors', level: 'beginner', compound: false,
    cues: ['Ξεκίνα από άνετο άνοιγμα.', 'Κλείσε με έλεγχο, παύση 1″.', 'Αργή επιστροφή.'],
  },
  {
    id: 'calf_machine', name: 'Γάμπες στο μηχάνημα', en: 'Calf Raise Machine', eq: ['calf_machine'], pattern: 'calves',
    primary: 'calves', level: 'beginner', compound: false,
    cues: ['Πλήρες τέντωμα κάτω, παύση 1″.', 'Ανέβα στις μύτες όσο πιο ψηλά γίνεται.', 'Χωρίς αναπηδήσεις.'],
  },
  {
    id: 'calf_leg_press', name: 'Γάμπες στην πρέσα', en: 'Leg Press Calf Raise', eq: ['leg_press'], pattern: 'calves',
    primary: 'calves', level: 'beginner', compound: false,
    cues: ['Μόνο οι μύτες στην άκρη της πλατφόρμας.', 'Γόνατα τεντωμένα αλλά όχι κλειδωμένα.', 'Αργή, πλήρης κίνηση.'],
  },
  {
    id: 'calf_db', name: 'Όρθιες γάμπες με αλτήρα', en: 'Standing Calf Raise', eq: ['dumbbells'], pattern: 'calves',
    primary: 'calves', level: 'beginner', compound: false,
    cues: ['Σε σκαλί για μεγαλύτερο εύρος.', 'Ένα πόδι τη φορά για περισσότερη αντίσταση.', 'Παύση πάνω.'],
  },

  /* ── Οριζόντια ώθηση ────────────────────────────────────────────────── */
  {
    id: 'chest_press', name: 'Πιέσεις στήθους στο μηχάνημα', en: 'Chest Press Machine', eq: ['chest_press'], pattern: 'hpush',
    primary: 'chest', secondary: ['triceps', 'shoulders'], level: 'beginner', compound: true,
    cues: ['Λαβές στο ύψος του μέσου στήθους.', 'Ωμοπλάτες πίσω και κάτω.', 'Σπρώξε χωρίς να κλειδώσεις αγκώνες.'],
  },
  {
    id: 'bench_db', name: 'Πιέσεις στήθους με αλτήρες', en: 'Dumbbell Bench Press', eq: ['dumbbells', 'bench'], pattern: 'hpush',
    primary: 'chest', secondary: ['triceps', 'shoulders'], level: 'beginner', compound: true,
    cues: ['Αγκώνες ~45° από τον κορμό.', 'Κατέβα μέχρι να νιώσεις τέντωμα στο στήθος.', 'Πέλματα σταθερά στο πάτωμα.'],
  },
  {
    id: 'incline_db', name: 'Κεκλιμένες πιέσεις με αλτήρες', en: 'Incline Dumbbell Press', eq: ['dumbbells', 'bench'], pattern: 'hpush',
    primary: 'chest', secondary: ['shoulders', 'triceps'], level: 'beginner', compound: true,
    cues: ['Κλίση πάγκου 30°.', 'Αλτήρες πάνω από το πάνω στήθος.', 'Ελεγχόμενη κάθοδος 2–3″.'],
  },
  {
    id: 'smith_bench', name: 'Πιέσεις στήθους στο Smith', en: 'Smith Bench Press', eq: ['smith', 'bench'], pattern: 'hpush',
    primary: 'chest', secondary: ['triceps'], level: 'beginner', compound: true,
    cues: ['Η μπάρα ακουμπά χαμηλά στο στήθος.', 'Ασφάλειες στο σωστό ύψος.', 'Ωμοπλάτες σφιγμένες.'],
  },
  {
    id: 'bench_bb', name: 'Πιέσεις πάγκου με μπάρα', en: 'Barbell Bench Press', eq: ['barbell', 'bench'], pattern: 'hpush',
    primary: 'chest', secondary: ['triceps', 'shoulders'], level: 'intermediate', compound: true, stress: ['shoulders'],
    cues: ['Μάτια κάτω από τη μπάρα, ωμοπλάτες «στις τσέπες».', 'Η μπάρα αγγίζει το κάτω στήθος.', 'Με βαριά κιλά, πάντα με βοηθό ή ασφάλειες.'],
  },
  {
    id: 'incline_bb', name: 'Κεκλιμένες πιέσεις με μπάρα', en: 'Incline Barbell Press', eq: ['barbell', 'bench'], pattern: 'hpush',
    primary: 'chest', secondary: ['shoulders', 'triceps'], level: 'intermediate', compound: true, stress: ['shoulders'],
    cues: ['Κλίση 30–45°.', 'Η μπάρα κατεβαίνει στο πάνω στήθος.', 'Αγκώνες κάτω από τη μπάρα.'],
  },
  {
    id: 'pushup', name: 'Κάμψεις', en: 'Push-Up', eq: [], pattern: 'hpush',
    primary: 'chest', secondary: ['triceps', 'core'], level: 'beginner', compound: true, stress: ['wrists'],
    cues: ['Σώμα ευθεία γραμμή από κεφάλι σε φτέρνες.', 'Αν δεν βγαίνουν, χέρια σε πάγκο.', 'Στήθος ως το πάτωμα.'],
  },
  {
    id: 'assisted_dip', name: 'Βυθίσεις με υποβοήθηση', en: 'Assisted Dip', eq: ['assisted_pullup'], pattern: 'hpush',
    primary: 'chest', secondary: ['triceps'], level: 'intermediate', compound: true, stress: ['shoulders'],
    cues: ['Γείρε λίγο μπροστά για στήθος.', 'Κατέβα μέχρι 90° στους αγκώνες.', 'Λιγότερο αντίβαρο = πιο δύσκολο.'],
  },
  {
    id: 'dips', name: 'Βυθίσεις στο δίζυγο', en: 'Parallel Bar Dip', eq: ['dip_bars'], pattern: 'hpush',
    primary: 'chest', secondary: ['triceps', 'shoulders'], level: 'advanced', compound: true, stress: ['shoulders'],
    cues: ['Ώμοι κάτω, μακριά από τα αυτιά.', 'Ελεγχόμενη κάθοδος.', 'Βάλε βάρος με ζώνη όταν περάσεις τις 12.'],
  },

  /* ── Απομόνωση στήθους ──────────────────────────────────────────────── */
  {
    id: 'pec_deck', name: 'Pec Deck (πεταλούδα)', en: 'Pec Deck Fly', eq: ['pec_deck'], pattern: 'chest_iso',
    primary: 'chest', level: 'beginner', compound: false,
    cues: ['Λαβές στο ύψος του στήθους.', 'Ελαφρώς λυγισμένοι αγκώνες, σταθεροί.', 'Σφίξε στη μέση 1″.'],
  },
  {
    id: 'cable_fly', name: 'Ανοίγματα στην τροχαλία', en: 'Cable Crossover', eq: ['cable'], pattern: 'chest_iso',
    primary: 'chest', level: 'beginner', compound: false,
    cues: ['Ένα βήμα μπροστά, ελαφριά κλίση.', 'Χέρια σε τόξο, σαν αγκαλιά.', 'Δοκίμασε από ψηλά προς χαμηλά και αντίστροφα.'],
  },
  {
    id: 'db_fly', name: 'Ανοίγματα με αλτήρες', en: 'Dumbbell Fly', eq: ['dumbbells', 'bench'], pattern: 'chest_iso',
    primary: 'chest', level: 'intermediate', compound: false, stress: ['shoulders'],
    cues: ['Ελαφριά κιλά — η άσκηση είναι για τέντωμα.', 'Μην κατεβαίνεις κάτω από τον πάγκο.', 'Αγκώνες ελαφρώς λυγισμένοι.'],
  },

  /* ── Κάθετη ώθηση ───────────────────────────────────────────────────── */
  {
    id: 'shoulder_press_m', name: 'Πιέσεις ώμων στο μηχάνημα', en: 'Shoulder Press Machine', eq: ['shoulder_press_m'], pattern: 'vpush',
    primary: 'shoulders', secondary: ['triceps'], level: 'beginner', compound: true, stress: ['shoulders'],
    cues: ['Λαβές στο ύψος του πηγουνιού.', 'Πλάτη κολλημένη στο στήριγμα.', 'Μην κλειδώνεις αγκώνες πάνω.'],
  },
  {
    id: 'db_shoulder', name: 'Πιέσεις ώμων με αλτήρες', en: 'Seated Dumbbell Press', eq: ['dumbbells', 'bench'], pattern: 'vpush',
    primary: 'shoulders', secondary: ['triceps'], level: 'beginner', compound: true, stress: ['shoulders'],
    cues: ['Πάγκος σχεδόν κάθετος.', 'Αλτήρες ως το ύψος των αυτιών.', 'Κοιλιά σφιχτή, χωρίς καμάρα.'],
  },
  {
    id: 'smith_ohp', name: 'Πιέσεις ώμων στο Smith', en: 'Smith Overhead Press', eq: ['smith', 'bench'], pattern: 'vpush',
    primary: 'shoulders', secondary: ['triceps'], level: 'beginner', compound: true, stress: ['shoulders'],
    cues: ['Πάγκος κάθετος μέσα στο Smith.', 'Η μπάρα περνά μπροστά από το πρόσωπο.', 'Σταθερός ρυθμός.'],
  },
  {
    id: 'ohp_bb', name: 'Στρατιωτικές πιέσεις με μπάρα', en: 'Overhead Press', eq: ['barbell'], pattern: 'vpush',
    primary: 'shoulders', secondary: ['triceps', 'core'], level: 'intermediate', compound: true, stress: ['shoulders', 'lowerback'],
    cues: ['Όρθιος, γλουτοί και κοιλιά σφιχτά.', 'Το κεφάλι «περνά» κάτω από τη μπάρα στο πάνω σημείο.', 'Χωρίς κλίση προς τα πίσω.'],
  },
  {
    id: 'arnold', name: 'Arnold press', en: 'Arnold Press', eq: ['dumbbells', 'bench'], pattern: 'vpush',
    primary: 'shoulders', secondary: ['triceps'], level: 'intermediate', compound: true, stress: ['shoulders'],
    cues: ['Ξεκίνα με παλάμες προς εσένα.', 'Περιστροφή καθώς σπρώχνεις.', 'Ελαφρύτερα κιλά από τις κλασικές πιέσεις.'],
  },

  /* ── Ώμοι απομόνωση ─────────────────────────────────────────────────── */
  {
    id: 'lateral_db', name: 'Πλάγιες εκτάσεις με αλτήρες', en: 'Lateral Raise', eq: ['dumbbells'], pattern: 'delt_iso',
    primary: 'shoulders', level: 'beginner', compound: false,
    cues: ['Σήκωσε ως το ύψος των ώμων, όχι ψηλότερα.', 'Οδήγησε με τους αγκώνες.', 'Ελαφριά κιλά, καθαρή τεχνική.'],
  },
  {
    id: 'lateral_cable', name: 'Πλάγιες εκτάσεις στην τροχαλία', en: 'Cable Lateral Raise', eq: ['cable'], pattern: 'delt_iso',
    primary: 'shoulders', level: 'beginner', compound: false,
    cues: ['Τροχαλία χαμηλά, ένα χέρι τη φορά.', 'Συνεχής ένταση σε όλο το εύρος.', 'Αργή κάθοδος.'],
  },
  {
    id: 'reverse_pec', name: 'Ανάποδο Pec Deck', en: 'Reverse Pec Deck', eq: ['pec_deck'], pattern: 'reardelt',
    primary: 'shoulders', secondary: ['back'], level: 'beginner', compound: false,
    cues: ['Στήθος στο μαξιλάρι.', 'Άνοιξε με τεντωμένα χέρια.', 'Μην σφίγγεις τους τραπεζοειδείς.'],
  },
  {
    id: 'face_pull', name: 'Face pull', en: 'Face Pull', eq: ['cable|band'], pattern: 'reardelt',
    primary: 'shoulders', secondary: ['back'], level: 'beginner', compound: false,
    cues: ['Σχοινί στο ύψος του προσώπου.', 'Τράβα προς τα μάτια, αγκώνες ψηλά.', 'Εξαιρετική για υγεία ώμων.'],
  },
  {
    id: 'rear_db', name: 'Οπίσθιοι ώμοι με αλτήρες', en: 'Rear Delt Raise', eq: ['dumbbells'], pattern: 'reardelt',
    primary: 'shoulders', secondary: ['back'], level: 'beginner', compound: false,
    cues: ['Σκυμμένος μπροστά, πλάτη ίσια.', 'Άνοιξε τα χέρια στο πλάι.', 'Ελαφριά κιλά.'],
  },

  /* ── Οριζόντια έλξη ─────────────────────────────────────────────────── */
  {
    id: 'seated_row', name: 'Καθιστή κωπηλατική τροχαλία', en: 'Seated Cable Row', eq: ['seated_row'], pattern: 'hpull',
    primary: 'back', secondary: ['biceps'], level: 'beginner', compound: true,
    cues: ['Στήθος ψηλά, μέση ουδέτερη.', 'Τράβα στον αφαλό, ωμοπλάτες μαζί.', 'Μην γέρνεις πίσω για να κλέψεις.'],
  },
  {
    id: 'row_machine', name: 'Κωπηλατική με στήριξη στήθους', en: 'Chest-Supported Row', eq: ['row_machine'], pattern: 'hpull',
    primary: 'back', secondary: ['biceps'], level: 'beginner', compound: true,
    cues: ['Στήθος κολλημένο στο μαξιλάρι.', 'Αγκώνες πίσω, όχι προς τα πάνω.', 'Παύση 1″ στο τέλος.'],
  },
  {
    id: 'db_row', name: 'Κωπηλατική με αλτήρα', en: 'One-Arm Dumbbell Row', eq: ['dumbbells', 'bench'], pattern: 'hpull',
    primary: 'back', secondary: ['biceps'], level: 'beginner', compound: true,
    cues: ['Χέρι και γόνατο στον πάγκο.', 'Τράβα τον αλτήρα προς το ισχίο.', 'Επαναλήψεις ανά χέρι.'],
  },
  {
    id: 'incline_db_row', name: 'Κωπηλατική σε κεκλιμένο πάγκο', en: 'Incline Dumbbell Row', eq: ['dumbbells', 'bench'], pattern: 'hpull',
    primary: 'back', secondary: ['shoulders', 'biceps'], level: 'beginner', compound: true,
    cues: ['Μπρούμυτα σε πάγκο 30–45°.', 'Και τα δύο χέρια μαζί.', 'Μηδενική φόρτιση στη μέση.'],
  },
  {
    id: 'bb_row', name: 'Κωπηλατική με μπάρα', en: 'Barbell Bent-Over Row', eq: ['barbell'], pattern: 'hpull',
    primary: 'back', secondary: ['biceps', 'core'], level: 'intermediate', compound: true, stress: ['lowerback'],
    cues: ['Κορμός σε ~45°, μέση ίσια.', 'Η μπάρα στο κάτω στήθος / αφαλό.', 'Χωρίς τινάγματα.'],
  },
  {
    id: 'inverted_row', name: 'Inverted row στο Smith', en: 'Inverted Row', eq: ['smith'], pattern: 'hpull',
    primary: 'back', secondary: ['biceps', 'core'], level: 'beginner', compound: true,
    cues: ['Κρεμάσου κάτω από τη μπάρα, σώμα ευθεία.', 'Τράβα το στήθος στη μπάρα.', 'Πιο οριζόντια = πιο δύσκολο.'],
  },

  /* ── Κάθετη έλξη ────────────────────────────────────────────────────── */
  {
    id: 'lat_pulldown', name: 'Τροχαλία πλάτης', en: 'Lat Pulldown', eq: ['lat_pulldown'], pattern: 'vpull',
    primary: 'back', secondary: ['biceps'], level: 'beginner', compound: true,
    cues: ['Λαβή λίγο πιο ανοιχτή από τους ώμους.', 'Τράβα στο πάνω στήθος, όχι πίσω από το κεφάλι.', 'Σκέψου «αγκώνες στις τσέπες».'],
  },
  {
    id: 'close_pulldown', name: 'Τροχαλία πλάτης με κλειστή λαβή', en: 'Close-Grip Pulldown', eq: ['lat_pulldown'], pattern: 'vpull',
    primary: 'back', secondary: ['biceps'], level: 'beginner', compound: true,
    cues: ['Λαβή V ή στενή υποκεφαλή.', 'Γείρε ελάχιστα πίσω.', 'Πλήρες τέντωμα πάνω.'],
  },
  {
    id: 'assisted_pullup', name: 'Έλξεις με υποβοήθηση', en: 'Assisted Pull-Up', eq: ['assisted_pullup'], pattern: 'vpull',
    primary: 'back', secondary: ['biceps'], level: 'beginner', compound: true,
    cues: ['Γόνατα στο μαξιλάρι αντίβαρου.', 'Πηγούνι πάνω από τη μπάρα.', 'Μείωνε το αντίβαρο κάθε 2–3 εβδομάδες.'],
  },
  {
    id: 'pullup', name: 'Έλξεις στο μονόζυγο', en: 'Pull-Up', eq: ['pullup_bar'], pattern: 'vpull',
    primary: 'back', secondary: ['biceps', 'core'], level: 'advanced', compound: true, stress: ['shoulders'],
    cues: ['Πλήρης κρέμαση κάτω.', 'Στήθος προς τη μπάρα.', 'Χωρίς κούνημα (kipping).'],
  },
  {
    id: 'straight_pulldown', name: 'Pulldown με τεντωμένα χέρια', en: 'Straight-Arm Pulldown', eq: ['cable'], pattern: 'vpull',
    primary: 'back', level: 'beginner', compound: false,
    cues: ['Χέρια σχεδόν τεντωμένα.', 'Φέρε τη μπάρα ως τους μηρούς.', 'Νιώσε τους πλατύτατους, όχι τους τρικέφαλους.'],
  },

  /* ── Δικέφαλοι ──────────────────────────────────────────────────────── */
  {
    id: 'db_curl', name: 'Κάμψεις δικεφάλων με αλτήρες', en: 'Dumbbell Curl', eq: ['dumbbells'], pattern: 'biceps',
    primary: 'biceps', level: 'beginner', compound: false,
    cues: ['Αγκώνες σταθεροί στο πλάι.', 'Στρίψε την παλάμη προς τα πάνω.', 'Αργή κάθοδος.'],
  },
  {
    id: 'hammer', name: 'Σφυριά', en: 'Hammer Curl', eq: ['dumbbells'], pattern: 'biceps',
    primary: 'biceps', level: 'beginner', compound: false,
    cues: ['Παλάμες η μία απέναντι στην άλλη.', 'Δουλεύει και τον βραχιόνιο.', 'Χωρίς αιώρηση.'],
  },
  {
    id: 'cable_curl', name: 'Κάμψεις στην τροχαλία', en: 'Cable Curl', eq: ['cable'], pattern: 'biceps',
    primary: 'biceps', level: 'beginner', compound: false,
    cues: ['Τροχαλία χαμηλά, ίσια μπάρα ή σχοινί.', 'Συνεχής ένταση.', 'Παύση πάνω.'],
  },
  {
    id: 'curl_machine', name: 'Κάμψεις στο μηχάνημα Preacher', en: 'Preacher Curl Machine', eq: ['curl_machine'], pattern: 'biceps',
    primary: 'biceps', level: 'beginner', compound: false,
    cues: ['Μασχάλη ακουμπά στην άκρη του μαξιλαριού.', 'Μην τεντώνεις απότομα κάτω.', 'Ελεγχόμενος ρυθμός.'],
  },
  {
    id: 'bb_curl', name: 'Κάμψεις με μπάρα', en: 'Barbell / EZ Curl', eq: ['ez_bar|barbell'], pattern: 'biceps',
    primary: 'biceps', level: 'beginner', compound: false, stress: ['wrists'],
    cues: ['Η EZ μπάρα είναι πιο φιλική στους καρπούς.', 'Χωρίς να κουνάς τον κορμό.', 'Αγκώνες μπροστά από τον κορμό.'],
  },
  {
    id: 'incline_curl', name: 'Κάμψεις σε κεκλιμένο πάγκο', en: 'Incline Dumbbell Curl', eq: ['dumbbells', 'bench'], pattern: 'biceps',
    primary: 'biceps', level: 'intermediate', compound: false,
    cues: ['Πάγκος 45–60°, χέρια κρέμονται.', 'Μέγιστο τέντωμα του δικεφάλου.', 'Ελαφρύτερα κιλά.'],
  },

  /* ── Τρικέφαλοι ─────────────────────────────────────────────────────── */
  {
    id: 'pushdown', name: 'Pushdown στην τροχαλία', en: 'Triceps Pushdown', eq: ['cable'], pattern: 'triceps',
    primary: 'triceps', level: 'beginner', compound: false,
    cues: ['Αγκώνες κολλημένοι στα πλευρά.', 'Τέντωσε πλήρως κάτω.', 'Σχοινί ή ίσια λαβή.'],
  },
  {
    id: 'overhead_cable', name: 'Εκτάσεις πάνω από το κεφάλι στην τροχαλία', en: 'Overhead Cable Extension', eq: ['cable'], pattern: 'triceps',
    primary: 'triceps', level: 'beginner', compound: false,
    cues: ['Πλάτη στην τροχαλία, σχοινί πίσω από το κεφάλι.', 'Αγκώνες ψηλά και σταθεροί.', 'Μεγάλο τέντωμα.'],
  },
  {
    id: 'db_overhead', name: 'Γαλλικές πιέσεις με αλτήρα', en: 'Overhead Dumbbell Extension', eq: ['dumbbells'], pattern: 'triceps',
    primary: 'triceps', level: 'beginner', compound: false,
    cues: ['Ένας αλτήρας με τα δύο χέρια.', 'Αγκώνες δείχνουν μπροστά.', 'Κατέβα πίσω από το κεφάλι.'],
  },
  {
    id: 'skullcrusher', name: 'Skull crushers', en: 'EZ Skull Crusher', eq: ['ez_bar|barbell', 'bench'], pattern: 'triceps',
    primary: 'triceps', level: 'intermediate', compound: false,
    cues: ['Ξαπλωμένος, η μπάρα κατεβαίνει πίσω από το μέτωπο.', 'Αγκώνες σταθεροί.', 'Μέτρια κιλά.'],
  },
  {
    id: 'bench_dip', name: 'Βυθίσεις σε πάγκο', en: 'Bench Dip', eq: ['bench'], pattern: 'triceps',
    primary: 'triceps', level: 'beginner', compound: false, stress: ['shoulders'],
    cues: ['Χέρια στην άκρη του πάγκου.', 'Πλάτη κοντά στον πάγκο.', 'Κατέβα έως 90°.'],
  },
  {
    id: 'close_bench', name: 'Πιέσεις με κλειστή λαβή', en: 'Close-Grip Bench Press', eq: ['barbell', 'bench'], pattern: 'triceps',
    primary: 'triceps', secondary: ['chest'], level: 'intermediate', compound: true, stress: ['wrists'],
    cues: ['Λαβή στο πλάτος των ώμων.', 'Αγκώνες κοντά στον κορμό.', 'Η μπάρα στο κάτω στήθος.'],
  },

  /* ── Κορμός ─────────────────────────────────────────────────────────── */
  {
    id: 'plank', name: 'Σανίδα', en: 'Plank', eq: [], pattern: 'core', timed: true,
    primary: 'core', level: 'beginner', compound: false,
    cues: ['Αγκώνες κάτω από τους ώμους.', 'Σφίξε γλουτούς και κοιλιά.', 'Μην πέφτει η λεκάνη.'],
  },
  {
    id: 'side_plank', name: 'Πλάγια σανίδα', en: 'Side Plank', eq: [], pattern: 'core', timed: true,
    primary: 'core', level: 'beginner', compound: false,
    cues: ['Αγκώνας κάτω από τον ώμο.', 'Ευθεία γραμμή από κεφάλι σε πόδια.', 'Χρόνος ανά πλευρά.'],
  },
  {
    id: 'dead_bug', name: 'Dead bug', en: 'Dead Bug', eq: [], pattern: 'core',
    primary: 'core', level: 'beginner', compound: false,
    cues: ['Μέση κολλημένη στο πάτωμα.', 'Αντίθετο χέρι-πόδι αργά.', 'Φιλική άσκηση για τη μέση.'],
  },
  {
    id: 'bird_dog', name: 'Bird dog', en: 'Bird Dog', eq: [], pattern: 'core',
    primary: 'core', secondary: ['glutes'], level: 'beginner', compound: false,
    cues: ['Στα τέσσερα.', 'Τέντωσε αντίθετο χέρι και πόδι.', 'Παύση 2″, χωρίς να γέρνει η λεκάνη.'],
  },
  {
    id: 'ab_machine', name: 'Κοιλιακοί στο μηχάνημα', en: 'Ab Crunch Machine', eq: ['abs_machine'], pattern: 'core',
    primary: 'core', level: 'beginner', compound: false,
    cues: ['Κύλησε τον κορμό, μην τραβάς με τα χέρια.', 'Εκπνοή στη σύσπαση.', 'Αργή επιστροφή.'],
  },
  {
    id: 'cable_crunch', name: 'Κοιλιακοί στην τροχαλία', en: 'Cable Crunch', eq: ['cable'], pattern: 'core',
    primary: 'core', level: 'intermediate', compound: false,
    cues: ['Γονατιστός, σχοινί δίπλα στο κεφάλι.', 'Φέρε τους αγκώνες στους μηρούς.', 'Η λεκάνη μένει σταθερή.'],
  },
  {
    id: 'pallof', name: 'Pallof press', en: 'Pallof Press', eq: ['cable|band'], pattern: 'core',
    primary: 'core', level: 'beginner', compound: false,
    cues: ['Πλάγια στην τροχαλία.', 'Σπρώξε μπροστά χωρίς να περιστραφείς.', 'Επαναλήψεις ανά πλευρά.'],
  },
  {
    id: 'hanging_knee', name: 'Ανυψώσεις γονάτων στο μονόζυγο', en: 'Hanging Knee Raise', eq: ['pullup_bar'], pattern: 'core',
    primary: 'core', level: 'intermediate', compound: false, stress: ['shoulders'],
    cues: ['Κρεμάσου χωρίς αιώρηση.', 'Φέρε τα γόνατα στο στήθος κυρτώνοντας τη λεκάνη.', 'Αργή κάθοδος.'],
  },
  {
    id: 'farmer', name: 'Μεταφορά αγρότη', en: "Farmer's Walk", eq: ['dumbbells|kettlebell'], pattern: 'core', timed: true,
    primary: 'core', secondary: ['back'], level: 'beginner', compound: true,
    cues: ['Βαριοί αλτήρες, όρθιος κορμός.', 'Μικρά, σταθερά βήματα.', 'Δυναμώνει λαβή και κορμό.'],
  },
]

export const EXERCISE_BY_ID = new Map(EXERCISES.map((e) => [e.id, e]))
