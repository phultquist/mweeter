import { GoogleAuthProvider, OAuthProvider, User } from '@firebase/auth';
import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import Link from 'next/link'
import Image from 'next/image'
import { useCollection, useDocument } from "react-firebase9-hooks/firestore";
import "../../util/clientApp";
import { doc, DocumentData, getFirestore, updateDoc, collection, documentId, limit, query, where } from '@firebase/firestore';
import { Layout, LoadingScreen, SecondaryButton, ErrorScreen, UserPreview } from '../../components';
import { ReactElement } from 'react';

export function UserPage(props: { user: User, userData: DocumentData }) {
    const router = useRouter();
    let { id } = router.query;
    let idString = id as string;

    if (!idString) {
        idString = "null";
    } else if (Array.isArray(id)) {
        idString = id[0];
    }


    const userRef = doc(getFirestore(), "users", idString);
    const [userDoc, userLoading, userError] = useDocument(userRef, {
        snapshotListenOptions: { includeMetadataChanges: true }
    });

    const userData = userDoc?.data();

    const userCollectionRef = collection(getFirestore(), 'users');
    console.log('userData');
    console.log(userData);

    console.log(userData?.following ? userData.following : ['null']);
    
    const followingQuery = query(userCollectionRef, where(documentId(), "in", userData?.following?.length ? userData.following : ['null']), limit(5));
    const [following, followingLoading, followingError] = useCollection(followingQuery, { snapshotListenOptions: { includeMetadataChanges: true } });

    if (userError || followingError) {
        return <ErrorScreen text={userError?.message || "No error message"} />
    } else if (userLoading || followingLoading) {
        return <LoadingScreen />
    } else if (!userDoc?.exists() || !userData) {
        return <ErrorScreen text="The user does not exist" />
    }


    return (
        <div className='p-16'>
            {
                userDoc.id === props.user.uid ?
                    <h1>People you follow</h1>
                    :
                    (
                        <>
                            <h1>{userData.first} {userData.last} <span className="text-gray-500 font-medium text-xl ml-2">@{userData.handle}</span></h1>
                            <h3>Following</h3>
                        </>
                    )
            }
            <div className="grid grid-cols-2 max-w-screen-md">
                {
                    !(following?.docs.length) ? <p className="text-gray-500 text-sm">No followers. Visit <Link href="/"><a href="/" className="underline">home</a></Link> to follow others</p>
                        : following.docs.map((doc) => {
                            return <div className="mr-8 border-t border-gray-300 py-2"><UserPreview authUser={props.user} authUserData={props.userData} previewUserDoc={doc} /></div>
                        })
                }
            </div>
        </div>
    )
}


UserPage.getLayout = (page: ReactElement, userInfo?: DocumentData) => {
    return <Layout highlight='profile' userInfo={userInfo}>{page}</Layout>;
}

export default UserPage;