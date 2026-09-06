import { useEffect, useState } from 'react'
import { Modal } from '../../../ui/components'
import { useExpenses } from '../store'

export function ReceiptViewer({ receiptId, onClose }: { receiptId: string; onClose: () => void }) {
  const store = useExpenses()
  const [url, setUrl] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    void store.getReceipt(receiptId).then((r) => {
      if (r) { objectUrl = URL.createObjectURL(r.blob); setUrl(objectUrl) } else setMissing(true)
    })
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptId])

  return (
    <Modal title="Απόδειξη" onClose={onClose} width={560}>
      {missing ? (
        <div className="muted">Η εικόνα δεν βρέθηκε.</div>
      ) : url ? (
        <img src={url} alt="Απόδειξη" style={{ width: '100%', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)' }} />
      ) : (
        <div className="dim">Φόρτωση…</div>
      )}
    </Modal>
  )
}
