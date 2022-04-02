// import firebase from 'firebase/compat';
// import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
// import { database } from './firebase';

export const editComment = async ({ comment, callback, index = 0 }) => {
  // try {
  //   const collectionReference = collection(database, process.env.GATSBY_FIREBASE_COMMENT_COLLECTION_NAME);
  //   let lastReply = comment.replies.at(-1);
  //   lastReply.uuid = doc(collectionReference).id;
  //   lastReply.createdAt = firebase.firestore.Timestamp.fromDate(new Date());
  //   const commentsQuery = await query(collectionReference, where(`uuid`, `==`, comment.uuid));
  //   const commentUuid = (await getDocs(commentsQuery)).docs.map(({ id }) => id)[0];
  //   const commentsReference = doc(database, process.env.GATSBY_FIREBASE_COMMENT_COLLECTION_NAME, commentUuid);
  //
  //   await updateDoc(commentsReference, {
  //     'replies': comment.replies
  //   });
  //
  //   if (callback) callback();
  // } catch (error) {
  //   console.log(error);
  // }
};
