import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const firebaseConfig = {
  apiKey: "AIzaSyCTOZ2CsRgxpTqqTmPdytsH7q8o-7AvER0",
  authDomain: "suivit-ic-tunisie.firebaseapp.com",
  projectId: "suivit-ic-tunisie",
  storageBucket: "suivit-ic-tunisie.firebasestorage.app",
  messagingSenderId: "147819920367",
  appId: "1:147819920367:web:90d9ec40dd78d8d4bad41a",
  measurementId: "G-23SWGW6BK5"
};

console.log("🔥 Initialisation de Firebase avec le projet :", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Charger les données de seed
const seedPath = join(__dirname, '..', 'firebase-seed-data.json');
const rawData = readFileSync(seedPath, 'utf-8');
const data = JSON.parse(rawData);

async function injecterCollection(collectionName, items) {
  console.log(`📦 Injection de la collection '${collectionName}' (${items.length} documents)...`);
  for (const item of items) {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item, { merge: true });
    console.log(`  ✓ Document [${collectionName}/${item.id}] synchronisé.`);
  }
}

async function runSeed() {
  try {
    if (data.cres) await injecterCollection('cres', data.cres);
    if (data.etablissements) await injecterCollection('etablissements', data.etablissements);
    if (data.comptes_locaux) await injecterCollection('comptes_locaux', data.comptes_locaux);
    if (data.agents_administratifs) await injecterCollection('agents_administratifs', data.agents_administratifs);
    if (data.admin_adjoints) await injecterCollection('admin_adjoints', data.admin_adjoints);
    if (data.demandes_elissa_edunet) await injecterCollection('demandes_elissa_edunet', data.demandes_elissa_edunet);

    console.log("🎉 Synchronisation Firebase Firestore terminée avec succès !");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur lors de l'injection :", err);
    process.exit(1);
  }
}

runSeed();
