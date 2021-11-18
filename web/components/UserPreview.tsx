import Image from 'next/image'
import { SecondaryButton } from '.';
import { DocumentSnapshot, getFirestore, doc, updateDoc, DocumentData } from '@firebase/firestore';
import { User } from '@firebase/auth';

export default function UserPreview(props: { authUser: User, authUserData: DocumentData, previewUserDoc: DocumentSnapshot }) {
    const data = props.previewUserDoc.data();
    if (!data || !props.authUserData) return <div></div>

    return (<div key={props.previewUserDoc.id} className="flex flex-row justify-between w-full py-3">
        <div className="flex flex-row space-x-2">
            <div className="w-8 h-8 overflow-hidden relative rounded-full border border-gray-200">
                <Image src={data.photoURL || '/default-pfp.jpeg'} layout='fill' alt={data.handle} />
            </div>
            <div>
                <p className="">
                    {data.first} {data.last}
                </p>
                <p className="text-sm text-gray-400">@{data.handle}</p>
            </div>
        </div>
        <div>
            <SecondaryButton text={props.authUserData.following?.includes(props.previewUserDoc.id) ? "Unfollow" : "Follow"} onClick={() => {
                const authUserRef = doc(getFirestore(), "users", props.authUser.uid);

                if (props.authUserData.following?.includes(props.previewUserDoc.id)) {
                    updateDoc(authUserRef, {
                        following: props.authUserData.following.filter((f: string) => f !== props.previewUserDoc.id),
                    });
                } else {
                    updateDoc(authUserRef, {
                        following: [...(props.authUserData.following || []), props.previewUserDoc.id],
                    });
                }
            }} />
        </div>
    </div>);
}