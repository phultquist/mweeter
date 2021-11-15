import { GoogleAuthProvider, OAuthProvider } from '@firebase/auth';
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useAuthState } from "react-firebase9-hooks/auth";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { auth } from "../firebase/clientApp";

const uiConfig = {
  signInFlow: 'popup',
  signInSuccessUrl: '/',
  signInOptions: [
    GoogleAuthProvider.PROVIDER_ID,
  ]
}

const SignInPage: NextPage = () => {
  const [user, loading, error] = useAuthState(auth);
  console.log(user);

  return (
    <div>
      {JSON.stringify(user)}
      {user ?
        "Signed in already" :
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
      }
    </div>
  )
}

export default SignInPage
