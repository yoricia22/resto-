import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000/api'

export const register = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/register`, {
    name,
    email,
    password
  })
  return response.data
}

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password
  })
  return response.data
}

export const getProfile = async () => {
  const token = localStorage.getItem('token')
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response.data
}