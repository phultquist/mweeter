import { User } from '@firebase/auth';
import type { NextPage } from 'next'
import { getFirestore, collection, addDoc, query, where, DocumentData, documentId, limit, orderBy, doc, updateDoc, getDoc } from '@firebase/firestore';
import { useCollection, useDocument } from "react-firebase9-hooks/firestore"
import { Button } from '.';
import { HumanizeDuration, HumanizeDurationLanguage } from 'humanize-duration-ts';
import Image from 'next/image';

import { auth, app, firestore } from "../util/clientApp";
import { ReactElement, useEffect, useState } from 'react';

const humanizer = new HumanizeDuration(new HumanizeDurationLanguage());

interface MweetData {
    docId: string;
    text: string;
    dateString: string;
    userId: string;
    userHandle?: string;
    photoURL?: string;
    date?: Date;
    userName?: string;
}

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

    const [mweetsData, setMweetsData] = useState<MweetData[]>([]);
    useEffect(() => {
        const orderedData: MweetData[] = !(mweets?.docs) ? [] : mweets?.docs.map(mweetDoc => {
            const data = mweetDoc.data();
            const date: Date = data.date.toDate();
            const timeSinceMweet = new Date().getTime() - date.getTime();
            let dateString = date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });

            // if date is less than a minute, show "Just Now"; if date is less than 24 hours old, display it as a duration
            if (timeSinceMweet < 60 * 1000) {
                dateString = 'Just Now';
            } else if (timeSinceMweet < 24 * 60 * 60 * 1000) {
                dateString = humanizer.humanize(new Date().getTime() - date.getTime(), { units: ["h", "m"], round: true }) + ' ago';
            }
            return {
                text: data.text,
                dateString,
                docId: mweetDoc.id,
                userId: data.user,
                date
            }
        }).sort((a, b) => b.date.getTime() - a.date.getTime());

        // There might be multiple mweets from the same person.
        // This notation removes duplicates from the array.
        const mweeterIds = Array.from(new Set(orderedData.map(mweet => mweet.userId)));

        // We get all the user docs of all the mweeters.
        const mweeterDataPromises = mweeterIds.map((mweeterId) => {
            const mweeterRef = doc(getFirestore(), "users", mweeterId);
            return getDoc(mweeterRef);
        });

        Promise.all(mweeterDataPromises).then((allMweeterData) => {

            // We now have all the mweeters' data.
            // We need to map the mweeters' data to the mweets.
            const mweetsWithUser = orderedData.map(mweet => {
                const mweeterDoc = allMweeterData.find(mweeter => mweeter.id === mweet.userId);
                if (!mweeterDoc || !mweeterDoc.exists()) {
                    return null;
                }
                const mweeterData = mweeterDoc.data();
                return {
                    ...mweet,
                    userHandle: mweeterData.handle,
                    photoURL: mweeterData.photoURL,
                    userName: mweeterData.first + ' ' + mweeterData.last
                }
            }).filter(mweet => mweet !== null) as MweetData[];

            setMweetsData(mweetsWithUser);
        });

    }, [mweets]);

    return (
        <div className="flex flex-row pt-10 px-10 space-x-10 max-h-screen overflow-y-scroll">
            <div className="w-2/3 pr-10">
                <div className="max-w-screen-md">
                    <div>
                        <h1>Your feed</h1>
                    </div>
                    <div className="overflow-hidden">
                        <div className="w-full">
                            <textarea value={mweet} onChange={(e) => setMweet(e.target.value)} name="" className="border border-gray-300 rounded-lg shadow-sm w-full min-h-[5rem] p-2 outline-none" />
                        </div>
                        <div className="float-right">
                            <Button text="Send Mweet" onClick={async () => {
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
                            }} />
                        </div>
                    </div>
                    <div className="pb-4">

                        {
                            !(mweetsData) ? <p className="">No Mweets. Follow users to see mweets!</p> : mweetsData.map((mweet, i) => {

                                return (
                                    <div key={mweet.docId} className="bg-white my-4 flex flex-row space-x-2">
                                        <div className="w-8 h-8 overflow-hidden relative rounded-full border border-gray-200">
                                            <Image src={mweet.photoURL || '/default-pfp.jpeg'} layout='fill' alt={mweet.userHandle} />
                                        </div>
                                        <div className="">
                                            <p className="text-sm font-semibold">{mweet.userName}<span className="ml-2 text-gray-500 text-xs font-normal">@{mweet.userHandle} • {mweet.dateString}</span></p>
                                            <p>{mweet.text}</p>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                </div>
            </div>
            <div className="flex-grow pt-10 overflow-hidden w-1/3" >
                <div className="fixed flex flex-col divide-y w-80">
                    <h2>Follow Others</h2>
                    {
                        notFollowing?.docs.map(userDoc => {
                            const data = userDoc.data();
                            return (
                                <div key={userDoc.id} className="flex flex-row justify-between w-full py-3">
                                    <div className="">
                                        <p className="">
                                            {data.first} {data.last}
                                        </p>
                                        <p className="text-sm text-gray-400">@{data.handle}</p>
                                    </div>
                                    <div>
                                        <button className="py-[0.1rem] px-3 text-sm bg-white border border-gray-300 rounded-full ml-4 hover:bg-gray-100 transition-all" onClick={() => {
                                            const userRef = doc(getFirestore(), "users", user.uid);
                                            updateDoc(userRef, {
                                                following: [...(props.userData.following || []), userDoc.id],
                                            });
                                        }}>
                                            Follow
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div >
    )
}

export default HomePage;