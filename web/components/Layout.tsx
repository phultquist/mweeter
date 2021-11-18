import { User } from '@firebase/auth'
import React, { ReactNode } from 'react'
import Link from 'next/link'
import { BsEmojiHeartEyes, BsBoxArrowRight, BsHandThumbsUp, BsHouse } from 'react-icons/bs'

type pages = '' | 'home' | 'edit-profile' | 'profile' | 'logout' | 'signin'

export default function Layout(props: { children: ReactNode, highlight?: pages }) {
    if (props.highlight === 'home') props.highlight = '';

    const items: { name: string, id: pages, icon: JSX.Element }[] = [
        {
            name: 'Home',
            id: '',
            icon: <BsHouse strokeWidth={0.6} />
        },
        {
            name: 'Following',
            id: 'profile',
            icon: <BsHandThumbsUp strokeWidth={0.6} />
        },
        {
            name: 'Your Profile',
            id: 'edit-profile',
            icon: <BsEmojiHeartEyes strokeWidth={0.6} />
        },
        {
            name: 'Logout',
            id: 'logout',
            icon: <BsBoxArrowRight strokeWidth={0.6} />
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
                                    <div className={`flex flex-row justify-start w-full rounded-md ${props.highlight === item.id ? 'font-bold bg-gray-200' : ''}`}>
                                        <div className="mx-2 my-auto text-gray-400">
                                        {item.icon}
                                        </div>
                                        <a href={'/' + item.id}>
                                            <p className={`text-gray-600 font-medium p-2`}>{item.name}</p>
                                        </a>
                                    </div>
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