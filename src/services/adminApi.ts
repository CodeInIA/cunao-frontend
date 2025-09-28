import axios from 'axios';
import { config } from '../config';

export async function adminLogin(email: string, password: string) {
  const res = await axios.post(`${config.API_URL}/admin/login`, { email, password });
  return res.data;
}

export async function fetchAdminReviews(status: 'pending'|'published') {
  const res = await axios.get(`${config.API_URL}/admin/reviews`, { params: { status } });
  return res.data;
}
