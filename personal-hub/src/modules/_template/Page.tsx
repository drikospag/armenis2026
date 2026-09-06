export function TemplatePage() {
  return (
    <>
      <div className="topbar">
        <div className="grow">
          <div className="h1">Νέο module</div>
          <div className="small dim">Αντίγραψε αυτόν τον φάκελο και ξεκίνα.</div>
        </div>
      </div>
      <div className="page stack">
        <div className="card card-pad">
          Γράψε εδώ το περιεχόμενό σου. Χρησιμοποίησε τις κλάσεις του design system:
          <code> card</code>, <code>card-pad</code>, <code>btn</code>, <code>input</code>,
          <code> table</code>, <code>stack</code>, <code>grid</code>, <code>row</code>.
        </div>
      </div>
    </>
  )
}
