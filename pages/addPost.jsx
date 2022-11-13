import axios from "axios";
import { useRouter } from "next/router";
import NewPostForm from "../components/NewPostForm";
import { authOptions } from './api/auth/[...nextauth]'
import { unstable_getServerSession } from "next-auth/next"

export default function Home() {
    const router = useRouter();

    const handleSubmit = async ({ language, code }) => {
        const { data } = await axios.post("api/posts", { language, code });
        router.push("/")
    };
    return (
        <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 mx-auto max-w-7xl px-2">
            <div className="max-w-2xl mx-auto">
                <NewPostForm onSubmit={handleSubmit}></NewPostForm>
            </div>
        </div>
    );
}

export async function getServerSideProps(context) {
    const session = await unstable_getServerSession(context.req, context.res, authOptions)
  
    if(!session) {
      return {
        redirect: {
          destination:"/api/auth/signin", 
          permanent:false
        }
      }
    }
    return {
      props: {
        session
      }
    }
  }