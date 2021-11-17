import { User } from "@firebase/auth";
import { useRouter } from "next/router";

export default function Profile(props: { user: User }) {
    const router = useRouter();
    router.push(`/user/${props.user.uid}`);
    return <div>Profile</div>;
}