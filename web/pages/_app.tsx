import { useAuthState } from "react-firebase9-hooks/auth";
import { useDocument } from 'react-firebase9-hooks/firestore';
import { useRouter } from 'next/router';
import { doc, getFirestore } from '@firebase/firestore';

import '../styles/globals.css'
import { AppPropsWithLayout } from '../util/types'
import { auth } from "../util/clientApp";
import { ErrorScreen, LoadingScreen, ProfilePage } from '../components';


export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);

  const userRef = doc(getFirestore(), "users", user?.uid || "null");
  const [userDoc, userLoading, userError] = useDocument(userRef, {
    snapshotListenOptions: { includeMetadataChanges: true }
  });

  if (loading || userLoading) {
    return <LoadingScreen />
  }

  console.log(router.pathname, user?.uid);
  const userData = userDoc?.data();

  if (!(router.pathname === '/signin')) {
    if (!user) {
      typeof window !== 'undefined' && router.push('/signin');
      return <div>Redirecting...</div>
    } else if (!userDoc?.exists() || !userData || !userData.photoURL) {
      return <ProfilePage user={user} userRef={userRef} mustFinish />
    } else if (error || userError) {
      return <ErrorScreen text={error?.message + '\n' + userError?.message} />
    }
  } else if (user) {
    // if user is signed in, and is visiting /signin, redirect to home
    typeof window !== 'undefined' && router.push('/');
    return <div>Redirecting...</div>
  }

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(<Component {...pageProps} user={user} userDoc={userDoc} userData={userData} userRef={userRef} />, userData)
}