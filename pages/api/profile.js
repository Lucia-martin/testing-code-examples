// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { unstable_getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { prisma } from '../../server/db/client'

export default async function handler(req, res) {
  const { method } = req
  let session = await unstable_getServerSession(req, res, authOptions)
  let prismaUser
  if (session) {
    prismaUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
  }

  switch (method) {
    case 'GET':
      const posts = await prisma.post.findMany({
        where: {
          userId: prismaUser.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: true,
        },
      })

      const comments = await prisma.comment.findMany({
          where: {
              userId: prismaUser.id
          },
          include: {
            user: true,
          },
      })
        res.status(200).json({posts, comments})
      break
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed.`)
  }
}
