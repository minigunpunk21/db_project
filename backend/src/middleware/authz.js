import jwt from 'jsonwebtoken';
export function requireAuth(req, res, next){
  try{
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if(!token) return res.status(401).json({ error: 'No token' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change_me_strong');
    req.user = payload; next();
  }catch(e){ return res.status(401).json({ error: 'Invalid token' }); }
}
