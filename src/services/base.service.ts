import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  Firestore,
  query,
  QueryConstraint,
  updateDoc,
  Unsubscribe,
} from "firebase/firestore";
import { DTO } from "../model/dto";

export abstract class BaseService<T extends DTO> {
  private subscription: Unsubscribe[] = [];

  constructor(protected collectionName: string, protected db: Firestore) {}

  clearSubscription() {
    this.subscription.forEach((x) => x());
    this.subscription = [];
  }

  addSubscription(subscription: Unsubscribe) {
    this.subscription.push(subscription);
  }

  get collection() {
    return collection(this.db, this.collectionName) as CollectionReference<T>;
  }

  collectionQuery(...queryConstraints: QueryConstraint[]) {
    const baseCollection = collection(this.db, this.collectionName);
    return query<T>(
      baseCollection as CollectionReference<T>,
      ...queryConstraints
    ); // HACK because no collection<T>
  }

  getDoc(id: string) {
    return doc<T>(this.collection, `${id}`);
  }

  async add(item: T) {
    return addDoc(this.collection, item as DocumentData); // HACK because no collection<T>
  }

  update(item: T) {
    const doc = this.getDoc(item.id!);
    return updateDoc(doc, item as DocumentData);
  }

  remove(id: string) {
    return deleteDoc(this.getDoc(id));
  }
}
