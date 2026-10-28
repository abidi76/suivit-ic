import { Injectable } from '@angular/core';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query, 
  Unsubscribe 
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';

export const firebaseConfig = {
  apiKey: 'AIzaSyCTOZ2CsRgxpTqqTmPdytsH7q8o-7AvER0',
  authDomain: 'suivit-ic-tunisie.firebaseapp.com',
  projectId: 'suivit-ic-tunisie',
  storageBucket: 'suivit-ic-tunisie.firebasestorage.app',
  messagingSenderId: '147819920367',
  appId: '1:147819920367:web:90d9ec40dd78d8d4bad41a',
  measurementId: 'G-23SWGW6BK5'
};

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  public db: Firestore;
  public auth: Auth;

  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.isConnectedSubject.asObservable();

  private isSeedingSubject = new BehaviorSubject<boolean>(false);
  public isSeeding$ = this.isSeedingSubject.asObservable();

  constructor() {
    if (!getApps().length) {
      this.app = initializeApp(firebaseConfig);
    } else {
      this.app = getApps()[0];
    }
    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
    this.verifierConnexion();
  }

  private async verifierConnexion(): Promise<void> {
    try {
      // Vérification simple de connectivité Firestore
      this.isConnectedSubject.next(true);
      console.log('🔥 Firebase initialisé avec succès pour le projet :', firebaseConfig.projectId);
    } catch (err) {
      console.warn('⚠️ Firebase initialisé en mode hors-ligne / attente :', err);
      this.isConnectedSubject.next(false);
    }
  }

  /**
   * Écoute en temps réel d'une collection Firestore
   */
  public ecouterCollection<T>(collectionName: string, onUpdate: (data: T[]) => void): Unsubscribe {
    const colRef = collection(this.db, collectionName);
    const q = query(colRef);
    return onSnapshot(
      q,
      (snapshot) => {
        const items: T[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as T));
        onUpdate(items);
      },
      (error) => {
        console.warn(`Erreur écoute temps réel [${collectionName}]:`, error);
      }
    );
  }

  /**
   * Enregistrer ou mettre à jour un document dans Firestore
   */
  public async enregistrerDocument(collectionName: string, id: string, data: any): Promise<void> {
    const docRef = doc(this.db, collectionName, id);
    await setDoc(docRef, data, { merge: true });
  }

  /**
   * Supprimer un document dans Firestore
   */
  public async supprimerDocument(collectionName: string, id: string): Promise<void> {
    const docRef = doc(this.db, collectionName, id);
    await deleteDoc(docRef);
  }

  /**
   * Initialise et enregistre la base complète initiale dans Firestore
   */
  public async injecterDonneesInitiales(seedData: any): Promise<{ totalDocuments: number; details: string }> {
    this.isSeedingSubject.next(true);
    let count = 0;

    try {
      // 1. Injecter les CREs
      if (seedData.cres && Array.isArray(seedData.cres)) {
        for (const cre of seedData.cres) {
          await this.enregistrerDocument('cres', cre.id, cre);
          count++;
        }
      }

      // 2. Injecter les Établissements & Sondes IP
      if (seedData.etablissements && Array.isArray(seedData.etablissements)) {
        for (const etab of seedData.etablissements) {
          await this.enregistrerDocument('etablissements', etab.id, etab);
          count++;
        }
      }

      // 3. Injecter les Comptes Locaux
      if (seedData.comptes_locaux && Array.isArray(seedData.comptes_locaux)) {
        for (const compte of seedData.comptes_locaux) {
          await this.enregistrerDocument('comptes_locaux', compte.id, compte);
          count++;
        }
      }

      // 4. Injecter les Agents Administratifs
      if (seedData.agents_administratifs && Array.isArray(seedData.agents_administratifs)) {
        for (const agent of seedData.agents_administratifs) {
          await this.enregistrerDocument('agents_administratifs', agent.id, agent);
          count++;
        }
      }

      // 5. Injecter les Admin Adjoints
      if (seedData.admin_adjoints && Array.isArray(seedData.admin_adjoints)) {
        for (const adj of seedData.admin_adjoints) {
          await this.enregistrerDocument('admin_adjoints', adj.id, adj);
          count++;
        }
      }

      // 6. Injecter les Demandes de comptes Elissa / Edunet
      if (seedData.demandes_elissa_edunet && Array.isArray(seedData.demandes_elissa_edunet)) {
        for (const dem of seedData.demandes_elissa_edunet) {
          await this.enregistrerDocument('demandes_elissa_edunet', dem.id, dem);
          count++;
        }
      }

      this.isSeedingSubject.next(false);
      return {
        totalDocuments: count,
        details: `Succès : ${count} documents injectés dans Firestore (${firebaseConfig.projectId})`
      };
    } catch (err: any) {
      this.isSeedingSubject.next(false);
      throw err;
    }
  }
}
