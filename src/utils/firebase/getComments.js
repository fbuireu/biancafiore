// import { collection, getDocs, query, where } from 'firebase/firestore';
// import { database } from './firebase';

export const getComments = async ({ articleSlug, callback }) => {
  // try {
  //   const collectionReference = collection(database, process.env.GATSBY_FIREBASE_COMMENT_COLLECTION_NAME);
  //   const commentsQuery = await query(collectionReference, where(`slug`, `==`, articleSlug));
  //   const comments = (await getDocs(commentsQuery)).docs
  //     .map(comment => ({ uuid: comment.data().id, ...comment.data() }));
  //
  //   if (!callback) return comments;
  //   callback(comments);
  // } catch (error) {
  //     reportError(error);
  // }
};
