// Image upload utility
export async function uploadImage(file) {
  // For now, convert to base64
  // In production, upload to a storage service (S3, Cloudinary, etc.)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function handleImageUpload(editor, file) {
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }
  
  uploadImage(file)
    .then((base64) => {
      editor.chain().focus().setImage({ src: base64, alt: file.name }).run()
    })
    .catch((error) => {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    })
}








