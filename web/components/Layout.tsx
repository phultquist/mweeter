import { User } from '@firebase/auth'
import React, { ReactNode } from 'react'

export default function Layout(props: { children: ReactNode }) {
    return (
        <div className="flex flex-row w-full h-full">
            <div className=" w-64 h-full min-h-screen p-4 bg-gray-100 border-r border-gray-300">
                <div className="flex flex-col h-full">
                    <h2 className="text-blue-400">mweeter</h2>
                    <ul className="">
                        <li className=""><a href="/" className="">Home</a></li>
                        <li className=""><a href="/profile" className="">Following</a></li>
                        <li className=""><a href="/edit-profile" className="">Your Profile</a></li>
                        <li className=""><a href="/logout" className="">Logout</a></li>
                    </ul>
                </div>
            </div>
            <div className="w-full p-4">
                <main>{props.children}</main>
            </div>
        </div>
    )
}