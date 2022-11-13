import Post from '../../components/Post'
import Comments from '../../components/Comments'
import Comment from '../../components/Comment'
import axios from 'axios'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { prisma } from '../../server/db/client'
import CommentForm from '../../components/CommentForm'
import { useSession, signIn, signOut } from 'next-auth/react'
import {useState, useEffect} from 'react'

export default function Code({ post, likes }) {
  const router = useRouter()
  let jsx
  const { data: session } = useSession()

  if (session) {
    likes.forEach((like) => {
      if (like.user.email === session.user.email) {
        post = { ...post, liked: true }
      }
    })
    jsx = (
      <CommentForm onSubmit={handleSubmit} user={session.user}></CommentForm>
    )
  }

   function handleSubmit(comment) {
   axios.post(`../api/comments/${post.id}`, { ...comment, session }).then(()=>window.location.reload())
  }

  function redirect() {
    if (!session) {
      router.push('/api/auth/signin')
    }
  }

  function handleLike(postId) {
    if (!session) {
      router.push('/api/auth/signin')
      return
    }
    axios.put('../api/posts', { id: postId }).then(()=> window.location.reload())

  }
  const fetcher = (url) => axios.get(url).then((res) => res.data)
  const { data, err } = useSWR(`../api/comments/${post.id}`, fetcher)

  if (err) return <div>{err}</div>
  if (!data) return <div> loading...</div>

  if (router.isFallback) {
    return <h2> loading...</h2>
  }

  return (
    <>
      <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 mx-auto max-w-7xl px-2">
        <div className="max-w-2xl mx-auto">
          <Post
            user={post.user}
            post={post}
            className="px-6 my-3 mt-10"
            smallMaxWith={'max-w-2xl'}
            largeMaxWith={'max-w-7xl'}
            onComment={() => redirect()}
            onLike={() => handleLike(post.id)}
            onShare={() => console.log('share')}
          />
          {jsx}
          <Comments comments={data} className=""></Comments>
        </div>
      </div>
    </>
  )
}

export async function getStaticProps(context) {
  const id = Number(context.params.id)

  if (id) {
    let returnedPost = await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    })

    let likes = await prisma.like.findMany({
      where: {
        postId: id,
      },
      include: {
        user: true,
      },
    })

    return {
      props: {
        post: JSON.parse(JSON.stringify(returnedPost)),
        likes: JSON.parse(JSON.stringify(likes)),
      },
      revalidate: 2
    }
  }
}

export async function getStaticPaths() {
  const posts = await prisma.post.findMany()
  const paths = posts.map((post) => {
    return {
      params: { id: `${post.id.toString()}` },
    }
  })

  return {
    paths,
    fallback: "blocking",
  }
}
