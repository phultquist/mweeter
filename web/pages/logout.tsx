import { useEffect } from "react";
import { auth } from "../firebase/clientApp";

export default function Logout() {
    useEffect(() => {
        auth.signOut()
    }, []);

    return <div>Logging out...</div>;
}