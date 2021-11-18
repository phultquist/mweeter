import { User } from '@firebase/auth';
import { DocumentData } from '@firebase/firestore';
import { ReactElement } from 'react';
import { HomePage, Layout } from '../components';

export function Home(props: { user: User, userData: DocumentData }) {
  return (
    <HomePage user={props.user} userData={props.userData} />
  )
}


Home.getLayout = (page: ReactElement, userInfo?: DocumentData) => {
  console.log(userInfo);
  
  return <Layout highlight='' userInfo={userInfo}>{page}</Layout>;
}


export default Home;
