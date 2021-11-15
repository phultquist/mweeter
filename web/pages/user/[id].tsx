import { GoogleAuthProvider, OAuthProvider } from '@firebase/auth';
import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import Head from 'next/head'
import Image from 'next/image'
import { useDocument } from "react-firebase9-hooks/firestore";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import "../../firebase/clientApp";
import { doc, getFirestore, updateDoc } from '@firebase/firestore';


const UserPage: NextPage = () => {
    const router = useRouter();
    let { id } = router.query;
    let idString = id as string;

    if (!idString) {
        idString = "null";
    } else if (Array.isArray(id)) {
        idString = id[0];
    }

    // const [user, loading, error] = useAuthState(auth);

    console.log(id);

    const userRef = doc(getFirestore(), "users", idString);
    const [userDoc, userLoading, userError] = useDocument(userRef, {
        snapshotListenOptions: { includeMetadataChanges: true }
    });

    if (userError) {
        return <div>Error: {userError}</div>
    } else if (userLoading) {
        return <div>Loading...</div>
    } else if (!userDoc?.exists()) {
        return <div>User not found</div>
    }

    const user = userDoc.data();

    return (
        <div>
            {user.first} {user.last} <br />
            @{user.handle} is following:
            {user.following.map((following: string) => {
                (
                    <div key={following}>
                        {following}
                        <button onClick={() => {
                            updateDoc(userRef, {
                                following: user.following.filter((f: string) => f !== following),
                            });
                        }}>Unfollow</button>
                    </div>
                )
            }
            )}
        </div>
    )
}

export default UserPage;