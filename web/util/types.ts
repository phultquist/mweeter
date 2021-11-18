import { DocumentData } from "@firebase/firestore"
import { NextPage } from "next"
import { AppProps } from "next/app"
import { ReactElement, ReactNode } from "react"

export type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement, userInfo?: DocumentData) => ReactNode
}

export type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
}