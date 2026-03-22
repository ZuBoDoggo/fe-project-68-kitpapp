import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const res = await fetch("https://backendpjforfrontend.vercel.app/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });
        
        const loginData = await res.json();
        
        if (res.ok && loginData.token) {
          const profileRes = await fetch("https://backendpjforfrontend.vercel.app/api/v1/auth/me", {
            method: "GET",
            headers: {
              authorization: `Bearer ${loginData.token}`
            }
          });

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            
            return { 
              id: profileData.data._id, 
              name: profileData.data.name,
              email: profileData.data.email,
              role: profileData.data.role, 
              token: loginData.token 
            };
          }
        }
        return null; 
      }
    })
  ],
  pages: {
    signIn: '/login',
  },

  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user.id;
        token.role = (user as any).role;
        token.accessToken = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session as any).user._id = token._id;
        (session as any).user.role = token.role;
        (session as any).user.token = token.accessToken;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };