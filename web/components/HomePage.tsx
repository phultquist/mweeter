import { User } from '@firebase/auth';
import type { NextPage } from 'next'
import { getFirestore, collection, addDoc, query, where, DocumentData, documentId, limit, orderBy, doc, updateDoc } from '@firebase/firestore';
import { useCollection } from "react-firebase9-hooks/firestore"

import Head from 'next/head';
import Image from 'next/image';

import { auth, app, firestore } from "../firebase/clientApp";
import { useState } from 'react';

const HomePage: NextPage<{ user: User, userData: DocumentData }> = props => {
    const { user } = props;
    const [mweet, setMweet] = useState('');
    const db = getFirestore();
    const mweetCollection = collection(db, "mweets");
    const userCollection = collection(db, "users");

    const following = [user.uid, ...props.userData.following || []];
    console.log(following);
    const notFollowingQuery = query(userCollection, where(documentId(), "not-in", following), limit(5));
    const mweetsQuery = query(mweetCollection, where("user", "in", [user.uid, ...props.userData.following || []]));

    const [mweets, loading, error] = useCollection(mweetsQuery, { snapshotListenOptions: { includeMetadataChanges: true } });
    const [notFollowing, notFollowingLoading, notFollowingError] = useCollection(notFollowingQuery, { snapshotListenOptions: { includeMetadataChanges: true } });

    return (
        <div>

            <h1>{props.userData.first} {props.userData.last} @{props.userData.handle}</h1>
            <div>
                <textarea value={mweet} onChange={(e) => setMweet(e.target.value)} name="" /> <br />
                <button onClick={async () => {
                    if (mweet.length > 280 || mweet.length < 1) {
                        alert("Invalid mweet: " + mweet.length);
                        return;
                    }
                    let docRef = await addDoc(mweetCollection, {
                        text: mweet,
                        date: new Date(),
                        user: user.uid,
                    })

                    setMweet('');
                    // add docRef id to user doc
                }}>Submit Mweet</button>
            </div>
            <div>

                {
                    mweets?.docs.map(mweetDoc => {
                        const data = mweetDoc.data();
                        const date = data.date.toDate();
                        return {
                            text: data.text,
                            id: mweetDoc.id,
                            date,
                            user: data.user,
                        }
                    }).sort((a, b) => b.date - a.date).map(mweetDoc => {
                        return (
                            <div key={mweetDoc.id}>
                                <section style={{
                                    border: "1px solid black",
                                    borderRadius: "5px",
                                    margin: "10px 10px",
                                }}>
                                    <p>{mweetDoc.date.toString()}</p>
                                    <p>{mweetDoc.text}</p>
                                </section>
                            </div>
                        )
                    })}
            </div>
            <h1>Find More People</h1>
            {
                notFollowing?.docs.map(userDoc => {
                    const data = userDoc.data();
                    return <div key={userDoc.id}>
                        {data.first} {data.last} @{data.handle}
                        <button onClick={() => {
                            const userRef = doc(getFirestore(), "users", user.uid);
                            updateDoc(userRef, {
                                following: [...(props.userData.following || []), userDoc.id],
                            });
                        }}>
                            Follow
                        </button>
                    </div>
                })
            }
            <button onClick={() => auth.signOut()}>Log Out</button>
        </div >
    )
}

export default HomePage
