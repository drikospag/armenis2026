import type { ReactNode } from 'react'

/**
 * Σχέδια των μηχανημάτων σε πλάγια όψη (120×80). Ζωγραφίζονται με τα χρώματα
 * του θέματος, οπότε δουλεύουν σε φωτεινό και σκούρο. Αν ο χρήστης ανεβάσει
 * δική του φωτογραφία, εμφανίζεται εκείνη στη θέση του σχεδίου.
 */

const F = 'eq-frame'
const P = 'eq-pad'
const W = 'eq-plate'

const ground = <line className="eq-ground" x1={4} y1={74} x2={116} y2={74} />

/** Στήλη βαρών (weight stack) στη δεξιά πλευρά. */
const stack = (x = 92, top = 14) => (
  <g>
    <rect className={F} x={x} y={top} width={20} height={74 - top} rx={2} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} className={W} x={x + 4} y={74 - 8 - i * 7} width={12} height={5} rx={1} />
    ))}
    <line className="eq-cable" x1={x + 10} y1={top + 4} x2={x + 10} y2={74 - 8 - 4 * 7} />
  </g>
)

/** Κάθισμα με πλάτη. */
const seat = (x = 24, y = 50, back = true) => (
  <g>
    {back && <rect className={P} x={x} y={y - 34} width={8} height={36} rx={3} />}
    <rect className={P} x={x} y={y} width={32} height={8} rx={3} />
    <line className={F} x1={x + 16} y1={y + 8} x2={x + 16} y2={74} />
  </g>
)

const ART: Record<string, ReactNode> = {
  /* ── Καρδιο ── */
  treadmill: (
    <>
      {ground}
      <rect className="eq-belt" x={8} y={60} width={82} height={9} rx={4.5} />
      <line className={F} x1={86} y1={62} x2={98} y2={20} />
      <line className={F} x1={96} y1={30} x2={76} y2={30} />
      <rect className={P} x={88} y={10} width={24} height={13} rx={3} />
      <line className="eq-accent" x1={20} y1={64.5} x2={70} y2={64.5} />
    </>
  ),
  bike: (
    <>
      {ground}
      <line className={F} x1={22} y1={72} x2={98} y2={72} />
      <line className={F} x1={46} y1={72} x2={52} y2={40} />
      <rect className={P} x={40} y={34} width={24} height={6} rx={3} />
      <line className={F} x1={84} y1={72} x2={88} y2={30} />
      <line className={F} x1={88} y1={30} x2={100} y2={26} />
      <circle className={F} cx={80} cy={56} r={12} />
      <circle className={W} cx={60} cy={58} r={4} />
      <line className={F} x1={60} y1={58} x2={80} y2={56} />
    </>
  ),
  elliptical: (
    <>
      {ground}
      <line className={F} x1={12} y1={72} x2={104} y2={72} />
      <line className={F} x1={92} y1={72} x2={94} y2={24} />
      <rect className={P} x={86} y={12} width={18} height={11} rx={3} />
      <line className={F} x1={90} y1={40} x2={70} y2={12} />
      <line className={F} x1={86} y1={44} x2={62} y2={18} />
      <rect className={P} x={30} y={60} width={24} height={5} rx={2.5} />
      <rect className={P} x={52} y={54} width={24} height={5} rx={2.5} />
      <line className={F} x1={54} y1={60} x2={88} y2={46} />
      <circle className={W} cx={98} cy={62} r={8} />
    </>
  ),
  rower: (
    <>
      {ground}
      <line className={F} x1={8} y1={64} x2={92} y2={64} />
      <line className={F} x1={12} y1={64} x2={12} y2={72} />
      <circle className={F} cx={100} cy={56} r={13} />
      <circle className={W} cx={100} cy={56} r={4} />
      <rect className={P} x={36} y={56} width={20} height={7} rx={3} />
      <rect className={P} x={76} y={48} width={6} height={16} rx={2} />
      <line className="eq-cable" x1={100} y1={52} x2={80} y2={44} />
      <line className={F} x1={74} y1={44} x2={84} y2={44} />
    </>
  ),
  stairs: (
    <>
      {ground}
      <polyline className={F} points="16,72 34,72 34,60 50,60 50,48 66,48 66,36 80,36" />
      <line className={F} x1={88} y1={74} x2={88} y2={22} />
      <line className={F} x1={88} y1={30} x2={68} y2={26} />
      <rect className={P} x={82} y={10} width={22} height={12} rx={3} />
    </>
  ),

  /* ── Πόδια ── */
  leg_press: (
    <>
      {ground}
      <line className={F} x1={8} y1={72} x2={112} y2={72} />
      <line className={F} x1={34} y1={70} x2={100} y2={18} />
      <polygon className={P} points="10,68 34,68 28,48 10,54" />
      <polygon className={P} points="64,44 86,28 92,38 70,54" />
      <circle className={W} cx={98} cy={24} r={7} />
      <line className={F} x1={52} y1={72} x2={60} y2={50} />
    </>
  ),
  hack_squat: (
    <>
      {ground}
      <line className={F} x1={10} y1={72} x2={100} y2={72} />
      <line className={F} x1={34} y1={72} x2={80} y2={10} />
      <polygon className={P} points="44,58 52,62 76,28 68,24" />
      <rect className={P} x={70} y={16} width={14} height={6} rx={3} />
      <polygon className={P} points="14,66 38,62 40,68 16,72" />
      <circle className={W} cx={88} cy={30} r={6} />
    </>
  ),
  leg_ext: (
    <>
      {ground}
      {seat(22, 46)}
      <line className={F} x1={54} y1={50} x2={70} y2={66} />
      <circle className={P} cx={72} cy={66} r={5} />
      {stack()}
    </>
  ),
  leg_curl_seated: (
    <>
      {ground}
      {seat(22, 50)}
      <rect className={P} x={36} y={38} width={22} height={6} rx={3} />
      <line className={F} x1={54} y1={54} x2={72} y2={66} />
      <circle className={P} cx={74} cy={64} r={5} />
      {stack()}
    </>
  ),
  leg_curl_lying: (
    <>
      {ground}
      <polygon className={P} points="10,42 74,36 74,44 10,50" />
      <line className={F} x1={22} y1={48} x2={20} y2={74} />
      <line className={F} x1={66} y1={42} x2={68} y2={74} />
      <line className={F} x1={74} y1={40} x2={86} y2={54} />
      <circle className={P} cx={80} cy={34} r={5} />
      {stack(94, 18)}
    </>
  ),
  abductor: (
    <>
      {ground}
      {seat(18, 48)}
      <rect className={P} x={56} y={30} width={7} height={20} rx={3} />
      <rect className={P} x={68} y={30} width={7} height={20} rx={3} />
      <path className="eq-accent" d="M56 26 l-6 -4 M75 26 l6 -4" />
      {stack()}
    </>
  ),
  adductor: (
    <>
      {ground}
      {seat(18, 48)}
      <rect className={P} x={52} y={30} width={7} height={20} rx={3} />
      <rect className={P} x={74} y={30} width={7} height={20} rx={3} />
      <path className="eq-accent" d="M60 24 l5 4 M73 24 l-5 4" />
      {stack()}
    </>
  ),
  glute_machine: (
    <>
      {ground}
      <rect className={P} x={12} y={42} width={30} height={8} rx={3} />
      <line className={F} x1={26} y1={50} x2={26} y2={74} />
      <path className={P} d="M46 50 Q64 30 82 50 L78 54 Q64 38 50 54 Z" />
      <line className={F} x1={64} y1={40} x2={64} y2={74} />
      <circle className={W} cx={90} cy={46} r={8} />
    </>
  ),
  calf_machine: (
    <>
      {ground}
      <line className={F} x1={38} y1={74} x2={38} y2={10} />
      <rect className={P} x={38} y={16} width={28} height={7} rx={3} />
      <rect className={P} x={44} y={64} width={22} height={8} rx={2} />
      {stack()}
    </>
  ),

  /* ── Πάνω σώμα ── */
  chest_press: (
    <>
      {ground}
      {seat(20, 50)}
      <line className={F} x1={28} y1={32} x2={64} y2={32} />
      <circle className={P} cx={66} cy={32} r={4} />
      <line className={F} x1={28} y1={20} x2={60} y2={20} />
      {stack()}
    </>
  ),
  pec_deck: (
    <>
      {ground}
      {seat(18, 50)}
      <line className={F} x1={26} y1={8} x2={84} y2={8} />
      <line className={F} x1={46} y1={8} x2={46} y2={14} />
      <line className={F} x1={70} y1={8} x2={70} y2={14} />
      <rect className={P} x={42} y={14} width={8} height={28} rx={3} />
      <rect className={P} x={66} y={14} width={8} height={28} rx={3} />
      {stack()}
    </>
  ),
  shoulder_press_m: (
    <>
      {ground}
      {seat(22, 50)}
      <line className={F} x1={34} y1={20} x2={52} y2={8} />
      <line className={F} x1={44} y1={8} x2={62} y2={8} />
      <circle className={P} cx={62} cy={8} r={4} />
      {stack()}
    </>
  ),
  lat_pulldown: (
    <>
      {ground}
      <line className={F} x1={80} y1={74} x2={80} y2={6} />
      <line className={F} x1={26} y1={6} x2={82} y2={6} />
      <line className="eq-cable" x1={34} y1={6} x2={34} y2={26} />
      <line className={F} x1={14} y1={26} x2={54} y2={26} />
      <rect className={P} x={22} y={54} width={26} height={7} rx={3} />
      <rect className={P} x={24} y={42} width={22} height={6} rx={3} />
      <line className={F} x1={35} y1={61} x2={35} y2={74} />
      {stack(86, 10)}
    </>
  ),
  seated_row: (
    <>
      {ground}
      <rect className={P} x={8} y={54} width={62} height={7} rx={3} />
      <line className={F} x1={18} y1={61} x2={18} y2={74} />
      <line className={F} x1={60} y1={61} x2={60} y2={74} />
      <rect className={P} x={72} y={42} width={7} height={18} rx={2} />
      <line className="eq-cable" x1={90} y1={40} x2={52} y2={40} />
      <path className={F} d="M52 40 l-6 -5 M52 40 l-6 5" />
      {stack(90, 16)}
    </>
  ),
  row_machine: (
    <>
      {ground}
      <rect className={P} x={18} y={50} width={26} height={7} rx={3} />
      <line className={F} x1={31} y1={57} x2={31} y2={74} />
      <polygon className={P} points="48,20 56,22 54,52 46,50" />
      <line className={F} x1={58} y1={34} x2={76} y2={42} />
      <circle className={P} cx={60} cy={34} r={4} />
      {stack()}
    </>
  ),
  assisted_pullup: (
    <>
      {ground}
      <line className={F} x1={20} y1={74} x2={20} y2={6} />
      <line className={F} x1={70} y1={74} x2={70} y2={6} />
      <line className={F} x1={12} y1={10} x2={78} y2={10} />
      <rect className={P} x={28} y={44} width={34} height={7} rx={3} />
      <rect className={P} x={24} y={62} width={14} height={5} rx={2} />
      <rect className={P} x={52} y={62} width={14} height={5} rx={2} />
      {stack(88, 18)}
    </>
  ),
  smith: (
    <>
      {ground}
      <line className={F} x1={24} y1={74} x2={24} y2={6} />
      <line className={F} x1={96} y1={74} x2={96} y2={6} />
      <line className={F} x1={20} y1={6} x2={100} y2={6} />
      <line className={F} x1={10} y1={32} x2={110} y2={32} />
      <rect className={W} x={12} y={22} width={7} height={20} rx={1.5} />
      <rect className={W} x={101} y={22} width={7} height={20} rx={1.5} />
      <rect className={P} x={40} y={58} width={40} height={6} rx={3} />
    </>
  ),
  back_ext: (
    <>
      {ground}
      <line className={F} x1={14} y1={72} x2={96} y2={72} />
      <line className={F} x1={26} y1={72} x2={74} y2={26} />
      <polygon className={P} points="62,26 82,38 78,44 58,32" />
      <circle className={P} cx={34} cy={62} r={5} />
    </>
  ),
  abs_machine: (
    <>
      {ground}
      {seat(20, 50)}
      <path className={P} d="M34 16 Q54 18 58 34 L52 36 Q50 24 34 22 Z" />
      {stack()}
    </>
  ),
  curl_machine: (
    <>
      {ground}
      <rect className={P} x={16} y={54} width={26} height={7} rx={3} />
      <line className={F} x1={29} y1={61} x2={29} y2={74} />
      <polygon className={P} points="34,30 64,40 64,48 34,38" />
      <line className={F} x1={50} y1={44} x2={50} y2={74} />
      <line className={F} x1={70} y1={26} x2={70} y2={44} />
      <circle className={P} cx={70} cy={26} r={4} />
      {stack()}
    </>
  ),

  /* ── Τροχαλίες ── */
  cable: (
    <>
      {ground}
      <rect className={F} x={8} y={8} width={14} height={66} rx={2} />
      <rect className={F} x={98} y={8} width={14} height={66} rx={2} />
      <line className={F} x1={8} y1={8} x2={112} y2={8} />
      <circle className={W} cx={22} cy={22} r={3} />
      <circle className={W} cx={98} cy={22} r={3} />
      <line className="eq-cable" x1={22} y1={22} x2={52} y2={46} />
      <line className="eq-cable" x1={98} y1={22} x2={68} y2={46} />
      <circle className={P} cx={52} cy={47} r={4} />
      <circle className={P} cx={68} cy={47} r={4} />
    </>
  ),

  /* ── Ελεύθερα βάρη ── */
  dumbbells: (
    <>
      {ground}
      <line className={F} x1={28} y1={34} x2={64} y2={34} />
      <rect className={W} x={20} y={22} width={9} height={24} rx={2} />
      <rect className={W} x={63} y={22} width={9} height={24} rx={2} />
      <line className={F} x1={52} y1={62} x2={84} y2={62} />
      <rect className={W} x={45} y={52} width={8} height={20} rx={2} />
      <rect className={W} x={83} y={52} width={8} height={20} rx={2} />
    </>
  ),
  barbell: (
    <>
      {ground}
      <line className={F} x1={4} y1={46} x2={116} y2={46} />
      <rect className={W} x={14} y={24} width={9} height={44} rx={2} />
      <rect className={W} x={24} y={30} width={6} height={32} rx={1.5} />
      <rect className={W} x={97} y={24} width={9} height={44} rx={2} />
      <rect className={W} x={90} y={30} width={6} height={32} rx={1.5} />
    </>
  ),
  ez_bar: (
    <>
      {ground}
      <polyline className={F} points="8,46 38,46 46,40 54,52 66,40 74,52 82,46 112,46" />
      <rect className={W} x={16} y={30} width={8} height={32} rx={2} />
      <rect className={W} x={96} y={30} width={8} height={32} rx={2} />
    </>
  ),
  bench: (
    <>
      {ground}
      <rect className={P} x={12} y={40} width={62} height={8} rx={4} />
      <polygon className={P} points="72,40 94,14 101,18 80,44" />
      <line className={F} x1={22} y1={48} x2={18} y2={74} />
      <line className={F} x1={70} y1={48} x2={76} y2={74} />
      <line className={F} x1={86} y1={36} x2={92} y2={74} />
    </>
  ),
  squat_rack: (
    <>
      {ground}
      <line className={F} x1={28} y1={74} x2={28} y2={6} />
      <line className={F} x1={92} y1={74} x2={92} y2={6} />
      <line className={F} x1={24} y1={6} x2={96} y2={6} />
      <line className={F} x1={20} y1={52} x2={100} y2={52} />
      <line className={F} x1={8} y1={28} x2={112} y2={28} />
      <rect className={W} x={10} y={16} width={8} height={24} rx={2} />
      <rect className={W} x={102} y={16} width={8} height={24} rx={2} />
    </>
  ),
  kettlebell: (
    <>
      {ground}
      <path className={F} d="M46 34 Q46 12 60 12 Q74 12 74 34" />
      <circle className={W} cx={60} cy={50} r={22} />
      <rect className={W} x={46} y={68} width={28} height={6} rx={2} />
    </>
  ),
  pullup_bar: (
    <>
      {ground}
      <line className={F} x1={20} y1={74} x2={20} y2={8} />
      <line className={F} x1={100} y1={74} x2={100} y2={8} />
      <line className={F} x1={12} y1={14} x2={108} y2={14} />
      <rect className={P} x={34} y={10} width={14} height={8} rx={3} />
      <rect className={P} x={72} y={10} width={14} height={8} rx={3} />
    </>
  ),
  dip_bars: (
    <>
      {ground}
      <line className={F} x1={14} y1={34} x2={66} y2={34} />
      <line className={F} x1={46} y1={46} x2={106} y2={46} />
      <line className={F} x1={22} y1={34} x2={22} y2={74} />
      <line className={F} x1={58} y1={34} x2={58} y2={74} />
      <line className={F} x1={56} y1={46} x2={56} y2={74} />
      <line className={F} x1={98} y1={46} x2={98} y2={74} />
      <rect className={P} x={14} y={30} width={14} height={8} rx={3} />
      <rect className={P} x={92} y={42} width={14} height={8} rx={3} />
    </>
  ),
  band: (
    <>
      {ground}
      <path className="eq-band" d="M16 40 Q60 6 104 40 Q60 74 16 40 Z" />
      <path className="eq-band eq-band-2" d="M28 40 Q60 18 92 40 Q60 62 28 40 Z" />
    </>
  ),
}

export function EquipmentArt({ id, photo, size = 'md', label }: {
  id: string
  photo?: string
  size?: 'sm' | 'md' | 'lg'
  label: string
}) {
  return (
    <span className={`eq-art eq-art-${size}`}>
      {photo ? (
        <img src={photo} alt={label} />
      ) : (
        <svg viewBox="0 0 120 80" role="img" aria-label={`Σχέδιο: ${label}`}>
          {ART[id] ?? ground}
        </svg>
      )}
    </span>
  )
}
