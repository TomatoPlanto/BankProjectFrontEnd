import { get, put } from '../utils/api.js'

export const userService = {
  // Returns the logged-in user's own profile
  async getMe(token) {
    const response = await get('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch profile')
    return response.json()
  },

  async getAllUsers(token) {
    const response = await get('/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  },

  async approveUser(token, userId) {
    const response = await put(`/api/users/${userId}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to approve user')
    return response.json()
  },

  async closeUser(token, userId) {
    const response = await put(`/api/users/${userId}/close`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to close user')
    return response.json()
  },
}