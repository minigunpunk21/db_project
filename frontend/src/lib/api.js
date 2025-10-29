export const API = import.meta.env.VITE_API_URL
export async function api(path, opts={}){ const res = await fetch(`${API}${path}`, opts); const data = await res.json().catch(()=>({})); if(!res.ok) throw new Error(data.error||'Request failed'); return data }
export const authHeaders = token => token ? { Authorization: `Bearer ${token}` } : {}
export const localDate = () => { const d = new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); }