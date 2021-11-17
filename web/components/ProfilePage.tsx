import { User } from '@firebase/auth';
import { DocumentReference, getFirestore, setDoc } from '@firebase/firestore';
import { doc } from 'firebase/firestore';
import type { NextPage } from 'next'

import { useState } from 'react';
import { useDocument } from 'react-firebase9-hooks/firestore';
import { auth } from "../util/clientApp";

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
            <p className="text-md mx-8 inline">First</p> <input className="border border-black rounded-md" value={first} onChange={(e) => setFirst(e.target.value)} /> <br />
            <p className="text-md mx-8 inline">Last</p> <input className="border border-black rounded-md" value={last} onChange={(e) => setLast(e.target.value)} /> <br />
            <p className="text-md mx-8 inline">Handle</p> <input className="border border-black rounded-md" value={handle} onChange={(e) => setHandle(e.target.value)} /> <br />
            <button onClick={async () => {
                // console.log(text);
                const token = await auth.currentUser?.getIdToken(true);
                const res = await fetch('/api/updateProfile', {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uid,
                        handle,
                        first,
                        last
                    })
                });
                const json = await res.json();
                console.log(json);
            }}>
                {userDoc?.exists() ? "Update Profile" : "Create Profile"}
            </button>
        </div >
    )
}

export default ProfilePage;