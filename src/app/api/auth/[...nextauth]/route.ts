import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { env } from '@/lib/env';
import { ExtendedSession } from '@/lib/types';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: env.github.clientId,
      clientSecret: env.github.clientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: any }): Promise<JWT> {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<ExtendedSession> {
      return {
        ...session,
        accessToken: token.accessToken as string | undefined,
      };
    },
  },
  pages: {
    signIn: '/',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
