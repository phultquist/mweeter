import { User } from '@firebase/auth';
import { DocumentReference } from '@firebase/firestore';
import { SignInPage } from '../components';
import { auth, app, firestore } from "../firebase/clientApp";
import { useRouter } from 'next/router';

export function SignIn(props: { user: User }) {
    const router = useRouter();
    
    // if (props.user) {
    //     router.push('/');
    // }
    return (
        <SignInPage />
    )
}

// Home.getLayout = (page) => <div>{page}</div>

export default SignIn;
