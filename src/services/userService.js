import { get, put } from '../utils/api.js'

export const userService = {
  async getMe(token) {
    const response = await get('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch profile')
    return response.json()
  },

  // backend returns a page object, use .content for the array
  async getAllUsers(token, page = 0, size = 20) {
    const response = await get(`/api/users?page=${page}&size=${size}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  },

  async searchByName(token, name) {
    const response = await get(`/api/users/search?name=${encodeURIComponent(name)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Search failed')
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