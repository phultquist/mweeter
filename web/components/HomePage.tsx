import { User } from '@firebase/auth';
import type { NextPage } from 'next'
import { getFirestore, collection, addDoc, query, where, DocumentData, documentId, limit, orderBy, doc, updateDoc } from '@firebase/firestore';
import { useCollection } from "react-firebase9-hooks/firestore"
import { Button } from '.';
import { HumanizeDuration, HumanizeDurationLanguage } from 'humanize-duration-ts';

import { auth, app, firestore } from "../util/clientApp";
import { ReactElement, useState } from 'react';

const humanizer = new HumanizeDuration(new HumanizeDurationLanguage());

function HomePage(props: { user: User, userData: DocumentData }) {
    const { user } = props;
    const [mweet, setMweet] = useState('');
    const db = getFirestore();
    const mweetCollection = collection(db, "mweets");
    const userCollection = collection(db, "users");

    const following = [user.uid, ...props.userData.following || []];

    const notFollowingQuery = query(userCollection, where(documentId(), "not-in", following), limit(5));
    const mweetsQuery = query(mweetCollection, where("user", "in", [user.uid, ...props.userData.following || []]));

    const [mweets, loading, error] = useCollection(mweetsQuery, { snapshotListenOptions: { includeMetadataChanges: true } });
    const [notFollowing, notFollowingLoading, notFollowingError] = useCollection(notFollowingQuery, { snapshotListenOptions: { includeMetadataChanges: true } });

    return (
        <div className="flex flex-row pt-10 px-10 space-x-10">
            <div className="w-2/3 pr-10">
                <div>
                    <h1>{props.userData.first} {props.userData.last} @{props.userData.handle}</h1>
                </div>
                <div>
                    <div className="w-full">
                        <textarea value={mweet} onChange={(e) => setMweet(e.target.value)} name="" className="border border-gray-300 rounded-lg shadow-sm w-full min-h-[5rem]" />
                    </div>
                    <Button text="Submit Mweet" onClick={async () => {
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
                    }} />
                </div>
                <div>

                    {
                        mweets?.docs.map(mweetDoc => {
                            const data = mweetDoc.data();
                            const date: Date = data.date.toDate();
                            return {
                                text: data.text,
                                id: mweetDoc.id,
                                date,
                                user: data.user,
                            }
                        }).sort((a, b) => b.date.getTime() - a.date.getTime()).map(mweetDoc => {
                            let dateString = mweetDoc.date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
                            let timeSinceMweet = new Date().getTime() - mweetDoc.date.getTime();

                            if (timeSinceMweet < 60 * 1000) {
                                // if date is less than a minute, show "Just Now"
                                dateString = 'Just Now';
                            } else if (timeSinceMweet < 24 * 60 * 60 * 1000) {
                                // if date is less than 24 hours old, display it as a duration
                                dateString = humanizer.humanize(new Date().getTime() - mweetDoc.date.getTime(), { units: ["h", "m"], round: true }) + ' ago';
                            }

                            return (
                                <div key={mweetDoc.id} className="bg-white my-4">
                                    <p className="text-xs text-gray-500">{dateString}</p>
                                    <p>{mweetDoc.text}</p>
                                </div>
                            )
                        })}
                </div>
            </div>
            <div className="flex-grow" >
                <h1>Find More People</h1>
                {
                    notFollowing?.docs.map(userDoc => {
                        const data = userDoc.data();
                        return <div key={userDoc.id}>
                            {data.first} {data.last} @{data.handle}
                            <button className="p-2 bg-gray-100 rounded-md ml-4 mb-4 hover:bg-gray-200 transition-all" onClick={() => {
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
            </div>
        </div >
    )
}

export default HomePage;