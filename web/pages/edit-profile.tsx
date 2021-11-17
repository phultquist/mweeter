import { User } from '@firebase/auth';
import { DocumentReference } from '@firebase/firestore';
import { ProfilePage } from '../components';
import { auth, app, firestore } from "../util/clientApp";
import { ReactElement } from 'react';
import { Layout } from '../components';

export function Profile(props: { user: User, userRef?: DocumentReference }) {
    return <ProfilePage user={props.user} userRef={props.userRef} />
}

Profile.getLayout = (page: ReactElement) => {
    return <Layout highlight='edit-profile'>{page}</Layout>;
  }

export default Profile;
