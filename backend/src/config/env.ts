import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 5000,

  jwtSecret: process.env.JWT_SECRET || "",

  databaseUrl: process.env.DATABASE_URL || "",
};

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is not configured");
}

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}