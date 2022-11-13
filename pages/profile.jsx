import { useSession, signIn, signOut } from 'next-auth/react'
import { authOptions } from './api/auth/[...nextauth]'
import { unstable_getServerSession } from 'next-auth/next'
import axios from 'axios'
import useSWR from 'swr'
import { useEffect, useState } from 'react'
import PostSmall from '../components/PostSmall'
import Comments from '../components/Comments'

export default function Profile() {
  const { data: session } = useSession()

  const fetcher = (url) => axios.get(url).then((res) => res.data)
  const { data, error } = useSWR('api/profile', fetcher)

  if (error) return <div>failed to load</div>
  if (!data) return <div> loading...</div>

  if (session) {
    return (
      <>
        <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 mx-auto max-w-7xl px-2">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-100 sm:text-4xl">
          <span className="block text-indigo-300">
            {session.user.name} posts
          </span>
        </h1>
        <ul className="mt-8">
          {data.posts?.map((post) => (
            <li key={post.id}>
              <PostSmall
                user={post.user}
                post={post}
                href={`/code/${post.id}`}
                className="my-10"
                onLike={() => handleLike(post.id)}
                onComment={() => router.push(`code/${post.id}`)}
                onShare={() => console.log('share post', post.id)}
              />
            </li>
          ))}
        </ul>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-100 sm:text-4xl">
          <span className="block text-indigo-300">
            {session.user.name} comments
          </span>
        </h1>
        <Comments comments={data.comments} className=""></Comments>
        </div>
    </div>
      </>
    )
  }
  return (
      <>
        Not signed in <br />
        <button onClick={() => signIn()}>Sign in</button>
      </>
    )
}

export async function getServerSideProps(context) {
  //authOptions needs to be declared inside of get serverside props (if not done that way, will give v8 error)
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions,
  )

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }
  return {
    props: {
      session,
    },
  }
}
