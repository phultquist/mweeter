import { User } from '@firebase/auth';
import { getFirestore, collection, addDoc, query, where, DocumentData, documentId, limit, orderBy, doc, updateDoc, getDoc } from '@firebase/firestore';
import { useCollection, useDocument } from "react-firebase9-hooks/firestore"
import { Button, SecondaryButton, UserPreview } from '.';
import { HumanizeDuration, HumanizeDurationLanguage } from 'humanize-duration-ts';
import Image from 'next/image';
import Link from 'next/link';

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

    const notFollowingQuery = query(userCollection, where(documentId(), "not-in", following || ['null']), limit(5));
    const mweetsQuery = query(mweetCollection, where("user", "in", [user.uid, ...props.userData.following || []]));

    const [mweets, loading, error] = useCollection(mweetsQuery, { snapshotListenOptions: { includeMetadataChanges: true } });
    const [notFollowing, notFollowingLoading, notFollowingError] = useCollection(notFollowingQuery, { snapshotListenOptions: { includeMetadataChanges: true } });

    const [mweetsData, setMweetsData] = useState<MweetData[]>([]);

    const [newMweetLoading, setNewMweetLoading] = useState(false);

    useEffect(() => {
        const orderedData: MweetData[] = !(mweets?.docs) ? [] : mweets?.docs.map(mweetDoc => {
            const data = mweetDoc.data();
            const date: Date = data.date.toDate();
            const timeSinceMweet = new Date().getTime() - date.getTime();
            let dateString = date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });

            // if date is less than a minute, show "Just Now"; if date is less than 24 hours old, display it as a duration
            if (timeSinceMweet < 60 * 1000) {
                dateString = 'Just Now';
            } else if (timeSinceMweet < 60 * 60 * 1000) {
                dateString = humanizer.humanize(new Date().getTime() - date.getTime(), { units: ["m"], round: true }) + ' ago';
            } else if (timeSinceMweet < 24 * 60 * 60 * 1000) {
                dateString = humanizer.humanize(new Date().getTime() - date.getTime(), { units: ["h"], round: true }) + ' ago';
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
        <div className="flex flex-row pt-16 px-16 space-x-10 max-h-screen overflow-y-scroll">
            <div className="w-2/3 pr-10">
                <div className="max-w-screen-md">
                    <div>
                        <h1>Your feed</h1>
                    </div>
                    <div className="overflow-hidden">
                        <div className="w-full">
                            <textarea disabled={newMweetLoading} value={mweet} onChange={(e) => setMweet(e.target.value)} name="" className="border border-gray-300 rounded-lg shadow-sm w-full min-h-[6rem] p-2 outline-none disabled:bg-gray-100" />
                        </div>
                        {mweet.length > 0 && <div className="text-xs  relative">
                            <p className={`absolute ${mweet.length > 280 ? 'text-red-400' : 'text-gray-300'}`}>{mweet.length} / 280</p>
                        </div>}
                        <div className="float-right">
                            <Button text="Send Mweet" disabled={newMweetLoading} onClick={async () => {
                                if (mweet.length > 280 || mweet.length < 1) {
                                    alert("Invalid mweet. Your mweet must be bewteen 1 and 280 characters.");
                                    return;
                                }

                                setNewMweetLoading(true);

                                const token = await auth.currentUser?.getIdToken(true);

                                const newMweet = {
                                    text: mweet,
                                }

                                await fetch('/api/mweet', {
                                    method: 'POST',
                                    mode: 'cors',
                                    headers: {
                                        'authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(newMweet)
                                })

                                setNewMweetLoading(false);
                                setMweet('');
                            }} />
                        </div>
                    </div>
                    <div className="pb-4">
                        {
                            !(mweetsData) ? <p className="">No Mweets. Follow users to see mweets!</p> : mweetsData.map((mweet, i) => {

                                return (
                                    <div key={mweet.docId} className="bg-white my-8 flex flex-row space-x-2 max-w-screen-sm">
                                        <Link href={`/user/${mweet.userId}`}>
                                            <div className="w-8 h-8 cursor-pointer flex-none overflow-hidden relative rounded-full border border-gray-200">
                                                <Image src={mweet.photoURL || '/default-pfp.jpeg'} layout='fill' alt={mweet.userHandle} />
                                            </div>
                                        </Link>
                                        <div className="">
                                            <Link href={`/user/${mweet.userId}`}>
                                                <p className="text-sm font-semibold cursor-pointer">{mweet.userName}<span className="ml-2 text-gray-500 text-xs font-normal">@{mweet.userHandle} • {mweet.dateString}</span></p>
                                            </Link>
                                            <p className="text-sm text-gray-600">{mweet.text}</p>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                </div>
            </div>
            <div className="flex-grow pt-10 overflow-hidden w-1/3" >
                <div className="fixed flex flex-col divide-y w-80">
                    <h2>
                        Follow Others
                        {notFollowing?.docs.length ? null : <p className="text-sm font-normal text-gray-500 mt-2">You've followed all the users. Great work!</p>}
                    </h2>
                    {
                        notFollowing?.docs.map((notFollowingDoc) => (
                            <UserPreview authUserData={props.userData} previewUserDoc={notFollowingDoc} authUser={props.user} />
                        ))
                    }
                </div>
            </div>
        </div >
    )
}

export default HomePage;