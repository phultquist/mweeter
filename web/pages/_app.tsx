import { useAuthState } from "react-firebase9-hooks/auth";
import { useDocument } from 'react-firebase9-hooks/firestore';
import { useRouter } from 'next/router';
import { doc, getFirestore } from '@firebase/firestore';

import '../styles/globals.css'
import { AppPropsWithLayout } from './types'
import { auth } from "../firebase/clientApp";
import { ProfilePage } from '../components';


export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);

  const userRef = doc(getFirestore(), "users", user?.uid || "null");
  const [userDoc, userLoading, userError] = useDocument(userRef, {
    snapshotListenOptions: { includeMetadataChanges: true }
  });

  if (loading || userLoading) {
    return <div>loading</div>
  } else if (error || userError) {
    return <div>error</div>
  }

  console.log(router.pathname, user?.uid);

  if (!(router.pathname === '/signin')) {
    if (!user) {
      typeof window !== 'undefined' && router.push('/signin');
      return <div>Redirecting...</div>
    } else if (!userDoc?.exists()) {
      return <ProfilePage user={user} userRef={userRef} />
    }
  }

  const userData = userDoc?.data();

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(<Component {...pageProps} user={user} userDoc={userDoc} userData={userData} userRef={userRef} />)
}