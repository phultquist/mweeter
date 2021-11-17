import { User } from '@firebase/auth';
import { DocumentData } from '@firebase/firestore';
import { ReactElement } from 'react';
import { HomePage, Layout } from '../components';

export function Home(props: { user: User, userData: DocumentData }) {
  return (
    <HomePage user={props.user} userData={props.userData} />
  )
}


Home.getLayout = (page: ReactElement) => {
  return <Layout highlight=''>{page}</Layout>;
}


export default Home;
