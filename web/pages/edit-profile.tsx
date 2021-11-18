import { User } from '@firebase/auth';
import { DocumentData, DocumentReference } from '@firebase/firestore';
import { ProfilePage } from '../components';
import { auth, app, firestore } from "../util/clientApp";
import { ReactElement } from 'react';
import { Layout } from '../components';

export function Profile(props: { user: User, userRef?: DocumentReference }) {
    return <ProfilePage user={props.user} userRef={props.userRef} />
}

Profile.getLayout = (page: ReactElement, userInfo?: DocumentData) => {
    return <Layout highlight='edit-profile' userInfo={userInfo}>{page}</Layout>;
  }

export default Profile;
