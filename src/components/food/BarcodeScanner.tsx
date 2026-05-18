'use client'
import * as React from 'react'
import { X, Scan } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import elMessages from '@/messages/el.json'
import enMessages from '@/messages/en.json'

interface BarcodeScannerProps {
  onFound: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onFound, onClose }: BarcodeScannerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [scanning, setScanning] = React.useState(true)
  const streamRef = React.useRef<MediaStream | null>(null)
  const { locale } = useStore()
  const t = locale === 'el' ? elMessages.food : enMessages.food

  React.useEffect(() => {
    let codeReader: import('@zxing/library').BrowserMultiFormatReader | null = null

    async function startScanner() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/library')
        codeReader = new BrowserMultiFormatReader()

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }

        codeReader.decodeFromStream(stream, videoRef.current!, (result, err) => {
          if (result) {
            setScanning(false)
            cleanup()
            onFound(result.getText())
          }
        })
      } catch (e) {
        setError(locale === 'el' ? 'Δεν είναι δυνατή η πρόσβαση στην κάμερα' : 'Cannot access camera')
      }
    }

    function cleanup() {
      codeReader?.reset()
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }

    startScanner()
    return cleanup
  }, [onFound, locale])

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 text-white">
        <h2 className="text-lg font-bold">{t.scanBarcode}</h2>
        <button
          onClick={() => {
            streamRef.current?.getTracks().forEach((t) => t.stop())
            onClose()
          }}
          className="p-2 rounded-full bg-white/20"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {error ? (
          <div className="text-white text-center p-8">
            <Scan className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-40 border-2 border-green-400 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-xl" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-6 text-center text-white/70 text-sm">
        {scanning && !error && t.scanning}
      </div>
    </div>
  )
}
