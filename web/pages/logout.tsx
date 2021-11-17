import { useEffect } from "react";
import { auth } from "../util/clientApp";

export default function Logout() {
    useEffect(() => {
        auth.signOut()
    }, []);

    return <div>Logging out...</div>;
}