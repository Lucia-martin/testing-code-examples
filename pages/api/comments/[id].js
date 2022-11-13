import { prisma } from '../../../server/db/client'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      let id = Number(req.query.id)
      const comments = await prisma.comment.findMany({
        where: {
          postId: id,
        },
        include: {
          user: true,
        },
      })
     
      res.status(200).json(comments)
      break
    case 'POST':
     
      const { comment, session } = req.body

      const prismaUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
      
    const comm = await prisma.comment.create({
      data: {
        content: comment,
        userId: prismaUser.id,
        postId: Number(req.query.id),
      },
    })
    await prisma.post.update({
      where: {
        id: Number(req.query.id)
      },
      data: {
        totalComments: {
          increment: 1
        }
      }
    })
    res.status(201).json(comm)
    break;
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed.`)
  }
}
