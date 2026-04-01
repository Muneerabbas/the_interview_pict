import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  (process.env.NODE_ENV === "development"
    ? "local-dev-auth-secret-change-me"
    : undefined);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions: {
        timeout: 10000,  // increase the timeout to 10 seconds
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.id = user.id || account.providerAccountId; // Ensure the ID is saved
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
