import 'dotenv/config';
import mysql from 'mysql2/promise';
async function main(){
  try{
    const pool = await mysql.createPool({
      host: process.env.DB_HOST, port:+(process.env.DB_PORT||3306),
      user: process.env.DB_USER, password: process.env.DB_PASS, database: process.env.DB_NAME,
    });
    const [[info]] = await pool.query('SELECT DATABASE() AS db, VERSION() AS ver');
    console.log('DB OK:', info);
    await pool.end();
  }catch(e){ console.error('DB ERROR:', e.message); process.exit(1); }
}
main();
