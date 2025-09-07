📂 Structure du repo
	•	Le repo GitHub s’appelle eclor-app.
	•	Le vrai projet Expo est dans le sous-dossier eclor/.
👉 Toutes les commandes doivent être lancées depuis eclor/, pas depuis la racine du repo.

Arbo simplifiée :
eclor-app/              # racine repo (git)
 ├── eclor/             # projet Expo
 │    ├── app/          # pages expo-router
 │    ├── components/   # composants React
 │    ├── app.json
 │    ├── package.json
 │    ├── yarn.lock
 │    └── node_modules/ (local, ignoré par git)
 └── .gitignore         # ignore .expo, node_modules, etc.



⚙️ Gestionnaire de paquets
	•	👉 Yarn uniquement (version 1.22.x actuellement).
	•	Pas de package-lock.json → supprimé pour éviter les conflits avec npm.
	•	Dépendances figées dans yarn.lock.

🚀 Commandes principales

   Depuis eclor/ :
   # Installer les dépendances
   yarn install

   # Lancer en mode web
   yarn dev:web

   # Lancer avec Expo Go (tunnel)
   yarn dev:tunnel

   # Vérifier la santé du projet
   yarn doctor   # alias de npx expo-doctor

🩺 Santé du projet
	•	SDK Expo : 53 (dernier à ce jour).
	•	React Native : 0.79.5.
	•	TypeScript : ~5.8.3 (aligné SDK).
	•	@types/react : ~19.0.10 (aligné SDK).
	•	expo-doctor → doit afficher 17/17 checks passed ✅.

📦 Mises à jour de dépendances
   •	Pour rester compatible Expo SDK, utiliser :
      npx expo install <package>
      (et non yarn add ou npm install <pkg>@latest).
	•	Vérifier les versions attendues :
      npx expo install --check
	•	Pour les dev deps (TypeScript, types…) → suivre ce que recommande expo-doctor. 

🔐 Bonnes pratiques
	•	Ne jamais committer node_modules/ ou .expo/.
	•	.expo/ est ignoré via .gitignore (vérifié ✅).
	•	En cas de doute :     
      git ls-files .expo   # doit rien afficher
   •	Si un jour tu vois des versions dupliquées → optionnel :
      npx yarn-deduplicate -s fewer yarn.lock && yarn install

❗ Points importants à retenir
	•	Toujours travailler depuis eclor/ (et pas eclor-app/).
	•	Projet full Yarn, ne jamais repasser à npm.
	•	SDK 53 = dernier disponible actuellement → pas de “SDK 54” encore.
	•	expo-doctor est la référence → doit rester à 17/17.
	•	Les warnings “deprecated” lors des installs sont normaux et sans impact.
