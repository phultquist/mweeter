import { GoogleAuthProvider, OAuthProvider } from '@firebase/auth';
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useAuthState } from "react-firebase9-hooks/auth";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { auth } from "../util/clientApp";

const uiConfig = {
  signInFlow: 'popup',
  signInSuccessUrl: '/',
  signInOptions: [
    GoogleAuthProvider.PROVIDER_ID,
  ]
}

const SignInPage: NextPage = () => {
  const [user, loading, error] = useAuthState(auth);

  return (
    <div id="firebaseui-auth-container">
      {JSON.stringify(user)}
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
    </div>
  )
}

export default SignInPage
