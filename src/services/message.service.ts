import {
  setDoc,
  doc,
  collection,
  Firestore,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import {
  deleteToken,
  getToken,
  Messaging,
  onMessage,
} from "firebase/messaging";
import { observe } from "mobx";
import { Severity } from "../interfaces/message";
import { RootStore } from "../state/root-store";

export class MessageService {
  constructor(
    public messaging: Messaging,
    private rootStore: RootStore,
    protected db: Firestore
  ) {
    this.receiveMessage();

    observe(this.rootStore.authStore, change => {
      if (this.rootStore.authStore.currentUser!.uid) {
        this.checkToken();
      }
    })
  }

  updateToken(token: string) {
    setDoc(
      doc(this.db, "fcmTokens", this.rootStore.authStore.currentUser!.uid),
      { token }
    );
  }

  setPermission(permission: boolean) {
    this.rootStore.uiStore.setNotificationAccess(permission);
  }

  async checkToken() {
    const user = this.rootStore.authStore.currentUser;
    if (user) {
      const docSnap = await getDoc(doc(collection(this.db, "fcmTokens"), user!.uid));

      if (docSnap.exists()) {
        this.rootStore.uiStore.setNotificationAccess(true)
      } else {
        this.rootStore.uiStore.setNotificationAccess(false)
      }
    }

  }

  async removeToken() {
    const user = this.rootStore.authStore.currentUser;
    deleteDoc(doc(collection(this.db, "fcmTokens"), user!.uid));
    this.rootStore.uiStore.setMessage({
      show: true,
      text: "Erfolgreich abgemeldet.",
      severity: Severity.info,
    });
    this.setPermission(false);
  }

  requestPermission = () => {
    Notification.requestPermission()
      .then((value: string) => {
        if (value === "default") {
          return Promise.reject(value);
        }
        if (value === "denied") {
          this.rootStore.uiStore.setMessage({
            show: true,
            text: "Benachrichtigen wurden permanent im Browser deaktiviert. Aktivieren Sie diese manuell.",
            severity: Severity.info,
          });
          return Promise.reject(value);
        }
        return getToken(this.messaging);
      })
      .then((token) => {
        this.rootStore.uiStore.setMessage({
          show: true,
          text: "Danke für Ihre Zustimmung.",
          severity: Severity.info,
        });
        this.updateToken(token);
      })
      .finally(() => {
        if (
          Notification.permission === "default" ||
          Notification.permission === "denied"
        ) {
          this.setPermission(false);
        } else {
          this.setPermission(true);
        }
      });
  };

  async removePermission() {
    await deleteToken(this.messaging);
    await this.removeToken();
  }

  receiveMessage() {
    if (this.messaging != null) {
      onMessage(this.messaging, (payload) => {
        this.rootStore.uiStore.setMessage({
          show: true,
          text: payload.notification?.body as string | "",
          severity: Severity.info,
        });
      });
    }
  }
}
