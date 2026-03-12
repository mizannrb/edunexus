import axios from 'axios'

const API_BASE = 'https://https://edunexus-api-4bd7.onrender.com/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// ── Courses ───────────────────────────────────────────────────────────────────
export const coursesAPI = {
  list: (params) => api.get('/courses/', { params }),
  adminList: (params) => api.get('/courses/admin/all', { params }),
  get: (slug) => api.get(`/courses/${slug}`),
  create: (data) => api.post('/courses/', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  addModule: (courseId, data) => api.post(`/courses/${courseId}/modules`, data),
  updateModule: (courseId, moduleId, data) => api.put(`/courses/${courseId}/modules/${moduleId}`, data),
  deleteModule: (courseId, moduleId) => api.delete(`/courses/${courseId}/modules/${moduleId}`),
  addLesson: (courseId, moduleId, data) => api.post(`/courses/${courseId}/modules/${moduleId}/lessons`, data),
  updateLesson: (courseId, moduleId, lessonId, data) => api.put(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId, moduleId, lessonId) => api.delete(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`),
}

// ── Enrollments ───────────────────────────────────────────────────────────────
export const enrollmentsAPI = {
  enroll: (courseId) => api.post('/enrollments/', { course_id: courseId }),
  myEnrollments: () => api.get('/enrollments/my'),
  updateProgress: (enrollmentId, data) => api.post(`/enrollments/${enrollmentId}/progress`, data),
  unenroll: (enrollmentId) => api.delete(`/enrollments/${enrollmentId}`),
  stats: () => api.get('/enrollments/admin/stats'),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  list: (params) => api.get('/users/', { params }),
  get: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/me/profile', data),
  changePassword: (data) => api.put('/users/me/password', data),
  adminUpdate: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  makeAdmin: (id) => api.post(`/users/${id}/make-admin`),
  revokeAdmin: (id) => api.post(`/users/${id}/revoke-admin`),
}

export default api
