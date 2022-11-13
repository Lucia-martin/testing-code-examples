import '../styles/globals.css'
import 'highlight.js/styles/stackoverflow-dark.css'

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
TimeAgo.setDefaultLocale(en.locale)
TimeAgo.addLocale(en)
import SiteNavigation from "../components/SiteNavigation"
import {SessionProvider} from "next-auth/react"


function MyApp({ Component, pageProps: {session, ...pageProps} }) {
  return (
    <>
    {/* <NavBar></NavBar> */}
    <SessionProvider session={session}>
    <SiteNavigation/>
    <Component {...pageProps} />
    </SessionProvider>
    </>
  )
}

export default MyApp
