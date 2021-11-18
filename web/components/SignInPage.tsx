import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup } from '@firebase/auth';
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { auth } from "../util/clientApp";

const provider = new OAuthProvider('microsoft.com');

provider.setCustomParameters({
  prompt: 'consent',
  tenant: 'common'
})

const uiConfig = {
  signInFlow: 'popup',
  signInSuccessUrl: '/',
  signInOptions: [
    GoogleAuthProvider.PROVIDER_ID,
  ]
}

const SignInPage: NextPage = () => {
  const auth = getAuth();

  return (
    <div className="flex w-screen h-screen">
      <div className="my-auto mx-auto pt-20">
        <div className="w-12 h-12 relative mx-auto">
          <Image src="/logo.svg" layout="fill" />
        </div>
        <h1 className="text-center -mt-1 mb-10">mweeter</h1>
        <div className="flex flex-row space-x-2">
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
          <div className="relative my-auto cursor-pointer" onClick={() => {
            signInWithPopup(auth, provider).then(function (result) {
              console.log(result);
            });

          }}>
            <div className='w-48 rounded-[5px] border border-[#bbb] relative h-10 overflow-hidden'>
              <Image src="/ms-signin.svg" layout="fill" />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default SignInPage
