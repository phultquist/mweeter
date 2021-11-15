import { User } from '@firebase/auth';
import { collection, DocumentReference, getFirestore, setDoc } from '@firebase/firestore';
import { doc } from 'firebase/firestore';
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react';
import { useDocument } from 'react-firebase9-hooks/firestore';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { auth } from "../firebase/clientApp";

const ProfilePage: NextPage<{ user: User, userRef?: DocumentReference }> = props => {
    const uid = props.user.uid;

    const [handle, setHandle] = useState('');
    const [first, setFirst] = useState('');
    const [last, setLast] = useState('');

    const db = getFirestore();

    let userRef = props.userRef;
    if (!props.userRef) {
        userRef = doc(db, "users", uid || "null");
    }

    const [userDoc, userLoading, userError] = useDocument(userRef, {
        snapshotListenOptions: { includeMetadataChanges: true }
    });

    return (
        <div>
            {!userDoc?.exists() && "Finish your profile to continue using Mweeter"}
            <h1>Profile</h1>
            First <input value={first} onChange={(e) => setFirst(e.target.value)} /> <br />
            Last <input value={last} onChange={(e) => setLast(e.target.value)} /> <br />
            Handle <input value={handle} onChange={(e) => setHandle(e.target.value)} /> <br />
            <button onClick={async () => {
                let docRef = doc(db, 'users', uid);
                await setDoc(docRef, {
                    handle,
                    first,
                    last,
                });
            }}>
            {userDoc?.exists() ? "Update Profile" : "Create Profile"}
        </button>
        </div >
    )
}

export default ProfilePage;