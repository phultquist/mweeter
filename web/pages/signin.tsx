import { User } from '@firebase/auth';
import { DocumentReference } from '@firebase/firestore';
import { SignInPage } from '../components';
import { auth, app, firestore } from "../util/clientApp";
import { useRouter } from 'next/router';

export function SignIn(props: { user: User }) {
    const router = useRouter();
    
    return (
        <SignInPage />
    )
}

export default SignIn;
