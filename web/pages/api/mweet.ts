import type { NextApiRequest, NextApiResponse } from 'next'
import { initializeApp, cert, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;
try {
    app = getApp();
} catch (e) {
    app = initializeApp({
        credential: cert({
            projectId: 'mweeter-app',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
        projectId: 'mweeter-app',
    });
}

export default async function updateProfile(req: NextApiRequest, res: NextApiResponse) {
    const { text } = req.body;
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const authorization = req.headers.authorization?.split("Bearer ")[1];
    let auth = getAuth(app);

    if (!authorization) {
        res.status(401).json({ error: "No authorization token provided" });
        return;
    } else if (!text ) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    } else if (text.length > 280 || text.length < 1) {
        res.status(400).json({ error: "Mweet must be between 1 and 280 characters" });
        return;
    }

    try {
        const decodedToken = await auth.verifyIdToken(authorization);
        let uid = decodedToken.uid;
        
        if (!uid) {
            res.status(401).json({ error: "No user id found in token" });
            return;
        }

        const db = getFirestore(app);

        const doc = await db.collection('mweets').add({
            text,
            date: new Date(),
            user: uid,
        });

        res.status(200).json({ message: "Mweet posted successfully", doc });
    } catch (e) {
        console.log(e);

        res.status(500).json({ error: `Unexpected error updating profile: ${e}` });
    }
}