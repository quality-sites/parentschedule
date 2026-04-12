import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import MicrosoftEntraIdProvider from 'next-auth/providers/azure-ad'; // Azure AD is Entra ID in v4
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// Build providers array conditionally based on env variables
const providers = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(GoogleProvider({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  }));
}

if (process.env.AUTH_MICROSOFT_ID && process.env.AUTH_MICROSOFT_SECRET) {
  providers.push(MicrosoftEntraIdProvider({
    clientId: process.env.AUTH_MICROSOFT_ID,
    clientSecret: process.env.AUTH_MICROSOFT_SECRET,
    tenantId: process.env.AUTH_MICROSOFT_TENANT_ID,
  }));
}

if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) {
  providers.push(AppleProvider({
    clientId: process.env.AUTH_APPLE_ID,
    clientSecret: process.env.AUTH_APPLE_SECRET,
  }));
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    ...providers,
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'parent@example.com' },
        password: { label: 'Password', type: 'password' },
        mode: { type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const isRegistering = credentials.mode === 'register';

        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // 1. REGISTRATION MODE
        if (isRegistering) {
          if (user && user.password) {
             throw new Error("Account already exists with this email.");
          }
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          
          if (user && !user.password) {
             // User exists (via Google/Apple) but has no password. Add password to their account.
             user = await prisma.user.update({
               where: { email: credentials.email },
               data: { password: hashedPassword }
             });
             return user as any;
          }
          
          // Brand new user
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
              name: credentials.email.split('@')[0],
            },
          });
          return user as any;
        }

        // 2. LOGIN MODE
        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return user as any;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev',
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) (session.user as any).id = token.id;
      return session;
    },
  },
};
