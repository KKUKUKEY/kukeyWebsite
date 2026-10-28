import mysql from "mysql2/promise";

// 1. 전역 변수(global)에 dbPool이 들어갈 수 있다고 타입스크립트 입을 막아버립니다.
declare global {
  var dbPool: mysql.Pool | undefined;
}

const pool: mysql.Pool =
  global.dbPool ||
  mysql.createPool({
    host: process.env.DB_HOST_TEST,
    user: process.env.DB_USER_TEST,
    password: process.env.DB_PASSWORD_TEST,
    database: process.env.DB_DATABASE_TEST,
    port: Number(process.env.DB_PORT_TEST || 3306),
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== "production") {
  global.dbPool = pool;
}
export default pool;
