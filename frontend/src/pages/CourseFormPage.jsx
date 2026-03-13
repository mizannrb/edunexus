import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, Loader2, ArrowLeft } from 'lucide-react'
import { coursesAPI } from '../services/api'
import toast from 'react-hot-toast'
import FileUpload from '../components/admin/FileUpload'

const LEVELS = ['beginner', 'intermediate', 'advanced']
const STATUSES = ['draft', 'published', 'archived']
const CATEGORIES = ['Web Development', 'Data Science', 'Design', 'Business', 'Marketing', 'Photography', 'Other']

export default function CourseFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', short_description: '', thumbnail_url: '',
    price: 0, is_free: true, level: 'beginner', status: 'draft',
    duration_hours: 0, category: '', tags: '',
    video_url: '', document_url: '',
  })

  useEffect(() => {
    if (isEdit) {
      setLoading(true)
      coursesAPI.adminList({ page: 1, size: 100 })
        .then(({ data }) => {
          const c = data.items.find(x => x.id === parseInt(id))
          if (c) {
            setForm({
              title: c.title, description: '', short_description: c.short_description || '',
              thumbnail_url: c.thumbnail_url || '', price: c.price, is_free: c.is_free,
              level: c.level, status: c.status, duration_hours: c.duration_hours,
              category: c.category || '', tags: '',
              video_url: c.video_url || '', document_url: c.document_url || '',
            })
            return coursesAPI.get(c.slug)
          }
        })
        .then(({ data }) => {
          if (data) {
            setForm(f => ({ ...f, description: data.description || '', tags: data.tags || '' }))
          }
        })
        .catch(() => toast.error('Failed to load course'))
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await coursesAPI.update(id, form)
        toast.success('Course updated!')
      } else {
        await coursesAPI.create(form)
        toast.success('Course created!')
      }
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-bold text-2xl">
            {isEdit ? 'Edit Course' : 'Create New Course'}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSave} className="space-y-6">

          {/* Basic Info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-heading font-bold text-lg text-gray-800">Basic Information</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course Title *</label>
              <input type="text" className="input-field" placeholder="e.g. Complete Web Development Bootcamp"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Description</label>
              <input type="text" className="input-field" placeholder="Brief one-liner about the course (max 500 chars)"
                value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} maxLength={500} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Description</label>
              <textarea className="input-field min-h-[120px] resize-y" placeholder="Detailed course description..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thumbnail URL</label>
              <input type="url" className="input-field" placeholder="https://example.com/image.jpg"
                value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} />
            </div>
          </div>

          {/* Course Settings */}
          <div className="card p-6 space-y-4">
            <h2 className="font-heading font-bold text-lg text-gray-800">Course Settings</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Level</label>
                <select className="input-field" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration (hours)</label>
                <input type="number" className="input-field" min="0" step="0.5"
                  value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_free}
                  onChange={e => setForm({ ...form, is_free: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded" />
                <span className="font-semibold text-gray-700 text-sm">Free Course</span>
              </label>
              {!form.is_free && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">Price (৳)</label>
                  <input type="number" className="input-field w-32" min="0" step="0.01"
                    value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (comma-separated)</label>
              <input type="text" className="input-field" placeholder="e.g. html, css, javascript, react"
                value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
            </div>
          </div>

          {/* Course Materials — File Upload */}
          <div className="card p-6 space-y-4">
            <h2 className="font-heading font-bold text-lg text-gray-800">Course Materials</h2>
            <p className="text-sm text-gray-500">Video, PDF, Image, Word, Excel, PowerPoint upload করুন</p>

            <FileUpload
              label="Course Video (MP4)"
              onUploadComplete={(file) => {
                if (file) setForm(prev => ({ ...prev, video_url: file.url }))
                else setForm(prev => ({ ...prev, video_url: '' }))
              }}
            />

            <FileUpload
              label="Course Document (PDF / Word / Excel / PowerPoint)"
              onUploadComplete={(file) => {
                if (file) setForm(prev => ({ ...prev, document_url: file.url }))
                else setForm(prev => ({ ...prev, document_url: '' }))
              }}
            />

            <FileUpload
              label="Course Image (JPG / PNG)"
              onUploadComplete={(file) => {
                if (file) setForm(prev => ({ ...prev, thumbnail_url: file.url }))
                else setForm(prev => ({ ...prev, thumbnail_url: '' }))
              }}
            />

            {/* Uploaded URLs preview */}
            {form.video_url && (
              <div className="bg-blue-50 rounded-lg p-3 text-sm">
                <span className="font-semibold text-blue-700">Video URL: </span>
                <a href={form.video_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                  {form.video_url}
                </a>
              </div>
            )}
            {form.document_url && (
              <div className="bg-green-50 rounded-lg p-3 text-sm">
                <span className="font-semibold text-green-700">Document URL: </span>
                <a href={form.document_url} target="_blank" rel="noreferrer" className="text-green-600 hover:underline truncate">
                  {form.document_url}
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-70">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                : <><Save className="w-4 h-4" />{isEdit ? 'Update Course' : 'Create Course'}</>
              }
            </button>
            <button type="button" onClick={() => navigate('/admin')} className="btn-outline">Cancel</button>
          </div>

        </form>
      </div>
    </div>
  )
}