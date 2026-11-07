import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const uri = requiredEnv("DB_URI");
const client = new MongoClient(uri);
const db = client.db("Bazar-Dor");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  secret: requiredEnv("BETTER_AUTH_SECRET"),
  baseURL: requiredEnv("BETTER_AUTH_URL"),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: requiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requiredEnv("GOOGLE_CLIENT_SECRET"),
    },
    github: {
      clientId: requiredEnv("GITHUB_CLIENT_ID"),
      clientSecret: requiredEnv("GITHUB_CLIENT_SECRET"),
    },
  },
});
