import axios from 'axios';

export async function adminLogin(email: string, password: string) {
  const res = await axios.post('/api/admin/login', { email, password });
  return res.data;
}

export async function fetchAdminReviews(status: 'pending'|'published') {
  const res = await axios.get('/api/admin/reviews', { params: { status } });
  return res.data;
}
