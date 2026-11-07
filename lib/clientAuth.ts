import { createAuthClient } from "better-auth/react";

export const clientAuth = createAuthClient();
export const { signUp, signIn,signOut, useSession } = clientAuth;
