import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',

      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },

      async authorize(credentials) {
        try {
          console.log('====================================')
          console.log('🔐 Login Request Started')
          console.log('Email:', credentials?.email)

          // Check if credentials are provided
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing email or password')
            return null
          }

          // Find user in database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })

          console.log('👤 User found:', user)

          // User does not exist
          if (!user) {
            console.log('❌ User not found')
            return null
          }

          // Compare password
          const passwordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log('🔑 Password Valid:', passwordValid)

          if (!passwordValid) {
            console.log('❌ Password mismatch')
            return null
          }

          console.log('✅ Login Successful')

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('❌ Authorize Error:', error)
          return null
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }

      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: true,
}