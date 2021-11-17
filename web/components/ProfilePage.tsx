import { User } from '@firebase/auth';
import { DocumentReference, getFirestore, setDoc } from '@firebase/firestore';
import { doc } from 'firebase/firestore';
import type { NextPage } from 'next'

import { useEffect, useState } from 'react';
import { useDocument } from 'react-firebase9-hooks/firestore';
import { auth } from "../util/clientApp";
import { TextInput, Button } from ".";

const ProfilePage: NextPage<{ user: User, userRef?: DocumentReference, mustFinish?: boolean }> = props => {
    const uid = props.user.uid;
    const db = getFirestore();

    let userRef = props.userRef;
    if (!props.userRef) {
        userRef = doc(db, "users", uid || "null");
    }

    const [userDoc, userLoading, userError] = useDocument(userRef, {
        snapshotListenOptions: { includeMetadataChanges: true }
    });

    const [handle, setHandle] = useState('');
    const [first, setFirst] = useState('');
    const [last, setLast] = useState('');

    const [message, setMessage] = useState<false | { text: string, divStyle: string, textStyle: string }>(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const data = userDoc?.data();

        setHandle(data ? data.handle : '');
        setFirst(data ? data.first : '');
        setLast(data ? data.last : '');
    }, [userDoc]);

    useEffect(() => {
        setTimeout(() => {
            setMessage(false);
        }, 3000);
    }, [message])

    return (
        <div className="p-10">
            {props.mustFinish && "Finish your profile to continue using Mweeter"}
            <h1>Profile</h1>
            <div className={`space-y-4 transition-all ${loading ? 'opacity-60' : 'opacity-100'}`}>

                <div className="flex flex-row space-x-6">
                    <TextInput
                        label="First Name"
                        value={first}
                        onChange={(value) => setFirst(value)}
                    />
                    <TextInput
                        label="Last Name"
                        value={last}
                        onChange={(value) => setLast(value)}
                    />
                </div>
                <TextInput
                    label="Handle"
                    value={handle}
                    onChange={(value) => setHandle(value)}
                />
                <TextInput
                    label="Email"
                    value={props.user.email || 'No Email'}
                    onChange={() => null}
                    disabled
                />
                <Button
                    text={props.mustFinish ? "Create Profile" : "Update Profile"}
                    onClick={async () => {
                        setLoading(true);
                        // the server needs to verify that the sender of the request is the user that they say they are
                        // so, a token is generated which uses Firebase's JWT to sign the user's uid
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
                                last,
                                photoURL: props.user.photoURL
                            })
                        });
                        const json = await res.json();
                        console.log(json);
                        setLoading(false);
                        if (json.error) {
                            setMessage({
                                text: json.error,
                                divStyle: 'bg-red-100 border-l-4 border-red-500',
                                textStyle: 'text-black'
                            });
                        } else {
                            setMessage({
                                text: json.message,
                                divStyle: 'bg-blue-100 border-l-4 border-blue-500',
                                textStyle: 'text-black'
                            });
                        }
                    }} />
                <div className={`transition-all p-4 ${message === false ? 'hidden' : ('block ' + message.divStyle)}`}>
                    {message !== false && <p className={message.textStyle}>{message.text}</p>}
                </div>
            </div>
        </div >
    )
}

export default ProfilePage;