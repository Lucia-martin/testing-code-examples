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
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: true,
        },
      })
  
      //need to fetch all the user's liked posts
      //if the post id matches the one on the posts being got,
      //add post.liked = true
      if (session) {
        let userLikedPosts = await prisma.like.findMany({
          where: {
            userId: prismaUser.id,
          },
        })
        let changedPosts = posts.map((post) => {
          let likedPost = userLikedPosts.find(
            (likePost) => likePost.postId == post.id,
          )
          if (likedPost) {
            return { ...post, liked: true }
          } else {
            return { ...post, liked: false }
          }
        })
        // console.log(userLikedPosts)
        res.status(200).json(changedPosts)
      } else {
        res.status(200).json(posts)
      }
      break
    case 'POST':
      if (!session) {
        res
          .status(401)
          .json({ error: 'you need to be signed in to create a post' })
        return
      }

      if (!prismaUser) {
        res
          .status(401)
          .json({ error: 'you need to be signed in to create a post' })
        return
      }
      const { language, code } = req.body
      const post = await prisma.post.create({
        data: {
          language,
          code,
          userId: prismaUser.id,
        },
      })
      res.status(201).json(post)
      break

    case 'PUT':
      let postID = Number(req.body.id)
      let liked
      let existingLike = await prisma.like.findFirst({
        where: {
          AND: [{ userId: prismaUser.id }, { postId: postID }],
        },
      })

      if (existingLike) {
        await prisma.like.delete({
          where: { id: existingLike.id },
        })
        await prisma.post.update({
          where: {
            id: postID,
          },
          data: {
            totalLikes: {
              decrement: 1,
            },
          },
        })
      } else {
        const like = await prisma.like.create({
          data: {
            userId: prismaUser.id,
            postId: postID,
          },
        })
        await prisma.post.update({
          where: {
            id: postID,
          },
          data: {
            totalLikes: {
              increment: 1,
            },
          },
        })
      }
      res.status(200).json(liked)
      break
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed.`)
  }
}
