/**
 * Μικραίνει μια φωτογραφία πριν αποθηκευτεί, ώστε να μη γεμίζει ο browser
 * με εικόνες των 5 MB από το κινητό. Αν ο browser δεν μπορεί να τη διαβάσει,
 * κρατάμε το αρχικό αρχείο.
 */
export async function shrinkImage(file: Blob, max = 1000): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const w = Math.round(bmp.width * scale)
    const h = Math.round(bmp.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h)
    bmp.close()
    const out = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.82))
    return out ?? file
  } catch {
    return file
  }
}
