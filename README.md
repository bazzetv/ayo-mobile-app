# AYO Training App

Bienvenue dans **AYO**, une application mobile de musculation, fitness et Hyrox.

> **Achieve Your Objectives** 💪

![AYO screenshot](./assets/screenshot-login.png)

---

## ⚙️ Stack technique

* **Expo** (React Native)
* **TypeScript**
* **Tailwind CSS** via Nativewind

## 🚀 Prérequis

### Node.js (>= 18)

Installez-le via :

* [https://nodejs.org/en/download](https://nodejs.org/en/download)
* ou via `nvm` :

```bash
# Installer NVM si ce n'est pas encore fait
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Redémarrez votre terminal ensuite puis :
source ~/.bashrc  # ou ~/.zshrc

# Installer Node.js 18
nvm install 18
nvm use 18
```

### Expo CLI

```bash
npm install -g expo-cli
```

---

## 🚀 Installation

```bash
git clone https://github.com/bazzetv/ayo-mobile-app.git
cd ayo-mobile-app
npm install
npx expo start
```

Vous pouvez ensuite lancer :

```bash
npm run ios      # Pour iOS
npm run android  # Pour Android
npm run web      # Pour le web
```

---

## 🔐 Authentification

* Sign in with Google
* Sign in with Apple

L'authentification est gérée entièrement par le backend. Aucun token n'est à configurer manuellement.

---

## 📚 Scripts disponibles

```json
"scripts": {
  "android": "expo start --android",
  "ios": "expo start --ios",
  "start": "expo start",
  "prebuild": "expo prebuild",
  "lint": "eslint \"**/*.{js,jsx,ts,tsx}\" && prettier -c \"**/*.{js,jsx,ts,tsx,json}\"",
  "format": "eslint \"**/*.{js,jsx,ts,tsx}\" --fix && prettier \"**/*.{js,jsx,ts,tsx,json}\" --write",
  "web": "expo start --web"
}
```

---

## 🔒 License

```
Copyright (c) 2025 Issam

This project is licensed under the AYO License - No Commercial Use Allowed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to use
and modify the Software for **personal and non-commercial purposes only**.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```
