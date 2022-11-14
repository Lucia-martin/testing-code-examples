import { useRouter } from 'next/router'
import axios from 'axios'
import useSWR from 'swr'
import Button from '../components/Button'
import PostSmall from '../components/PostSmall'
import { useSession } from 'next-auth/react'
import {useState, useEffect} from 'react'

export default function Home() {
  const router = useRouter()
const [posts, setPosts] = useState([])
const [err, setErr] =useState(null)

const [liked, setLiked] = useState("")
  useEffect(()=> {
    axios
    .get('/api/posts')
    .then((res) => {
      setPosts(res.data)
    })
    .catch((err) => {
      console.log(err)
    })
}, [liked])
  
  const fetcher = (url) => axios.get(url).then((res) => res.data)
  const { data, error } = useSWR('api/posts', fetcher)
 
  const { data: session } = useSession()
  
  function handleLike(postId) {
    if(!session) {
      router.push("/api/auth/signin")
      return;
    }
    axios.put("api/posts", {id: postId})
    setLiked(postId)
  } 

  if (error) return <div>failed to load</div>
  if (!data) return <div> loading...</div>

  return (
    <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 mx-auto max-w-7xl px-2">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-100 sm:text-4xl">
          <span className="block">Welcome to</span>
          <span className="block text-indigo-300">Your Assignment</span>
        </h1>
        <Button onClick={() => router.push('/addPost')}>Create a Post</Button>

        <ul className="mt-8">
          {posts?.map((post) => (
            <li key={post.id}>
              <PostSmall
                user={post.user}
                post={post}
                href={`/code/${post.id}`}
                className="my-10"
                onLike={()=>handleLike(post.id)}
                onComment={() => router.push(`code/${post.id}`)}
                onShare={() => console.log('share post', post.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
