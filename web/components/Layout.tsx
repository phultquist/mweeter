import { User } from '@firebase/auth'
import React, { ReactNode } from 'react'
import Link from 'next/link'

type pages = '' | 'home' | 'edit-profile' | 'profile' | 'logout' | 'signin'

export default function Layout(props: { children: ReactNode, highlight?: pages }) {
    if (props.highlight === 'home') props.highlight = '';

    const items: { name: string, id: pages, icon: string }[] = [
        {
            name: 'Home',
            id: '',
            icon: ''
        },
        {
            name: 'Following',
            id: 'profile',
            icon: ''
        },
        {
            name: 'Your Profile',
            id: 'edit-profile',
            icon: ''
        },
        {
            name: 'Logout',
            id: 'logout',
            icon: ''
        }
    ];
    return (
        <div className="flex flex-row w-full h-full">
            <div className=" w-64 h-full min-h-screen p-4 bg-gray-100 border-r border-gray-300">
                <div className="flex flex-col h-full">
                    <h2 className="text-blue-400">mweeter</h2>
                    <ul className="">
                        {items.map((item, index) => {
                            return <li key={index}>
                                <Link href={'/' + item.id}>
                                    <a href={'/' + item.id}>
                                        <p className={`text-gray-600 font-medium p-2 rounded-md ${props.highlight === item.id ? 'font-bold bg-gray-200' : ''}`}>{item.name}</p>
                                    </a>
                                </Link>
                            </li>
                        })}
                    </ul>
                </div>
            </div>
            <div className="w-full">
                <main>{props.children}</main>
            </div>
        </div>
    )
}