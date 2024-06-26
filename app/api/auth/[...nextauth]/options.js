import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt"

export const options = {
    providers:[
        GithubProvider({
            profile(profile) {
                console.log("Profile GitHub: ", profile);
        
                let userRole = "GitHub User";
                if (profile?.email == "harshit.shah@codezeros.com") {
                  userRole = "admin";
                }
        
                return {
                  ...profile,
                  role: userRole,
                };
              },
              clientId: process.env.GITHUB_ID,
              clientSecret: process.env.GITHUB_Secret,
            }), 
            CredentialsProvider({
                name: "Credentials",
                credentials: {
                  email: {
                    label: "email:",
                    type: "text",
                    placeholder: "your-email",
                  },
                  password: {
                    label: "password:",
                    type: "password",
                    placeholder: "your-password",
                  },
                },
                async authorize(credentials) {
                  try {
                    const foundUser = await User.findOne({ email: credentials.email })
                      .lean()
                      .exec();
          
                    if (foundUser) {
                      console.log("User Exists");
                      const match = await bcrypt.compare(
                        credentials.password,
                        foundUser.password
                      );
          
                      if (match) {
                        console.log("Good Pass");
                        delete foundUser.password;
          
                        foundUser["role"] = "Unverified Email";
                        return foundUser;
                      }
                    }
                  } catch (error) {
                    console.log(error);
                  }
                  return null;
                },
              }),
       
    ],
    callbacks: {
        async jwt({ token, user }) {
          if (user) token.role = user.role;
          return token;
        },
        async session({ session, token }) {
          if (session?.user) session.user.role = token.role;
          return session;
        },
      },
}

