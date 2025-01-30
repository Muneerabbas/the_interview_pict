import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
  secret: "d01c16547d0994133aeefd2b22d48f0819907cfea58c8c645395a1aef623acf9", // Add the secret to the config
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
