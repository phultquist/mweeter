import { GoogleAuthProvider, OAuthProvider } from '@firebase/auth';
import { doc, getFirestore } from '@firebase/firestore';
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useAuthState } from "react-firebase9-hooks/auth";
import { useDocument } from 'react-firebase9-hooks/firestore';
import { HomePage, SignInPage, ProfilePage } from '../components';
import { auth, app, firestore } from "../firebase/clientApp";

const Home: NextPage = () => {
  const [user, loading, error] = useAuthState(auth);

  const userRef = doc(getFirestore(), "users", user?.uid || "null");
  const [userDoc, userLoading, userError] = useDocument(userRef, {
    snapshotListenOptions: { includeMetadataChanges: true }
  });

  if (!user) {
    return <SignInPage />;
  } else if (loading || userLoading) {
    return <div>loading</div>
  } else if (error || userError) {
    return <div>error</div>
  } else if (!userDoc?.exists()) {    
    return <ProfilePage user={user} userRef={userRef} />
  }

  return (
    <div>
      {user ?
        <HomePage user={user} userData={userDoc.data()} /> :
        <SignInPage />
      }
    </div>
  )
}

export default Home;
