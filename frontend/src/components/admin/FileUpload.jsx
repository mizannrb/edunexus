import { useState, useRef } from 'react'
import { Upload, X, FileText, Film, Image, File } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const FILE_ICONS = {
  video: Film,
  image: Image,
  pdf: FileText,
  document: File,
}

const FILE_ACCEPT = [
  "video/mp4", "video/webm",
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
].join(",")

export default function FileUpload({ onUploadComplete, label = "Upload File" }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState(null)
  const fileRef = useRef()

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setProgress(10)

    const formData = new FormData()
    formData.append('file', file)

    try {
      setProgress(40)
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProgress(100)
      setUploadedFile(res.data)
      onUploadComplete && onUploadComplete(res.data)
      toast.success('File uploaded successfully!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleRemove = () => {
    setUploadedFile(null)
    fileRef.current.value = ''
    onUploadComplete && onUploadComplete(null)
  }

  const FileIcon = uploadedFile ? (FILE_ICONS[uploadedFile.file_type] || File) : Upload

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>

      {!uploadedFile ? (
        <div
          onClick={() => fileRef.current.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">Click to upload file</p>
          <p className="text-gray-400 text-sm mt-1">Video, PDF, Image, Word, Excel, PowerPoint</p>
          <p className="text-gray-400 text-xs mt-1">Max: Video 500MB • Others 50MB</p>
        </div>
      ) : (
        <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center gap-4">
          <FileIcon className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{uploadedFile.file_name}</p>
            <p className="text-sm text-gray-500 capitalize">{uploadedFile.file_type} • {(uploadedFile.file_size / 1024 / 1024).toFixed(2)} MB</p>
            <a href={uploadedFile.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline">
              View file
            </a>
          </div>
          <button onClick={handleRemove} className="text-red-500 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {uploading && (
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={FILE_ACCEPT}
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}