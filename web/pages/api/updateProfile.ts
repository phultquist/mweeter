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

/**
 * Technically, this is the only function that needs to be in the backend.
 * Firestore allows all other functions to be written in the frontend, because
 * of the security rules I can write. For example, a mweet is verified by the cloud
 * firestore rules if the userId is correct and if it has a date, text, and userId.
 * @param req 
 * @param res 
 */
export default async function updateProfile(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  let { handle, first, last, photoURL } = req.body;
  handle = handle.trim().toLowerCase();
  if (photoURL === null) {
    photoURL = 'https://i.ibb.co/GxSptzK/defualt-pfp.jpg';
  }
  const authorization = req.headers.authorization?.split("Bearer ")[1];
  let auth = getAuth(app);

  if (!authorization) {
    res.status(401).json({ error: "No authorization token provided" });
    return;
  } else if (!handle || !first || !last || !photoURL) {
    console.log(handle, first, last, photoURL);
    
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const decodedToken = await auth.verifyIdToken(authorization);
    let uid = decodedToken.uid;

    if (!uid) {
      res.status(401).json({ error: "No user id found in token" });
      return;
    }

    let db = getFirestore(app);

    const usersCollection = db.collection("users");
    const userHandleSnapshot = await usersCollection.where("handle", "==", handle).get();
    let handleTaken = false;

    userHandleSnapshot.docs.forEach(doc => {
      console.log(doc.data(), doc.id);

      if (doc.id !== uid) {
        handleTaken = true;
      }
    });

    if (handleTaken) {
      res.status(400).json({ error: "Handle already in use" });
      return;
    }
    console.log({ handle, first, last, photoURL });

    await db.doc(`users/${uid}`).set({
      handle,
      first,
      last,
      photoURL
    }, {
      merge: true,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      data: {
        uid,
        handle,
        first,
        last
      }
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({ error: `Unexpected error updating profile: ${e}` });
  }
}