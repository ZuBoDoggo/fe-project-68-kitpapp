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
          // 2. 🟢 สำคัญมาก: เอา Token ที่ได้ ไปยิงดึงข้อมูล Profile เพื่อเอา role
          const profileRes = await fetch("https://backendpjforfrontend.vercel.app/api/v1/auth/me", {
            method: "GET",
            headers: {
              authorization: `Bearer ${loginData.token}`
            }
          });

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            
            // 3. ส่งข้อมูลทั้งหมดที่จำเป็น (รวมถึง role) กลับไปให้ NextAuth
            return { 
              id: profileData.data._id, 
              name: profileData.data.name,
              email: profileData.data.email,
              role: profileData.data.role, // 👈 ตรงนี้แหละที่เราต้องการ!
              token: loginData.token 
            };
          }
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // 4. เอาข้อมูลจากข้อ 3 มายัดใส่ JWT Token
      if (user) {
        token._id = user.id;
        token.role = (user as any).role; // ยัด role เข้า token
        token.accessToken = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      // 5. เอาข้อมูลจาก JWT Token มายัดใส่ Session เพื่อให้ Client (Frontend) เรียกใช้ได้
      if (session.user) {
        (session as any).user._id = token._id;
        (session as any).user.role = token.role; // ยัด role เข้า session
        (session as any).user.token = token.accessToken;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };