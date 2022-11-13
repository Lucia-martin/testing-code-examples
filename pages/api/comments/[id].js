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
      // const session = await unstable_getServerSession(req, res, authOptions)
      // if (!session) {
      //   res
      //     .status(401)
      //     .json({ error: 'you need to be signed in to create a post' })
      //   return
      // }
    
      // if (!prismaUser) {
      //   res
      //     .status(401)
      //     .json({ error: 'you need to be signed in to create a post' })
      //   return
      // }
      const { comment, session } = req.body
      // console.log(req.body)
      // console.log(comment)

      const prismaUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      })

      // console.log(prismaUser)
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
