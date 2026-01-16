# 🚀 Personal AI CMS - Content Management System

> Ein modernes, KI-gestütztes Personal Content Management System mit integriertem Projektmanagement, AI-Planner, Gamification und interaktivem Dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.18-38B2AC?style=flat-square&logo=tailwind-css)

## 📋 Inhaltsverzeichnis

- [Features](#-features)
- [Technologie-Stack](#️-technologie-stack)
- [Installation](#-installation)
- [Entwicklung](#-entwicklung)
- [Projektstruktur](#-projektstruktur)
- [Konfiguration](#️-konfiguration)
- [Deployment](#-deployment)
- [Lizenz](#-lizenz)

## ✨ Features

### 🎯 Mission Control - Zentrale Dashboard
- **Übersichtliche Startseite** mit allen wichtigen Metriken auf einen Blick
- **Echtzeit-Projektübersicht** mit Fortschrittsanzeigen
- **Tagesplanung-Widget** zeigt anstehende Termine und Aufgaben
- **XP-System** mit Leveling und Fortschrittsanzeige
- **Gamification-Elemente** für erhöhte Motivation

### 📁 Projektmanagement
- Vollständiges **Projekt-Tracking** mit Status und Fortschritt
- **Task-Management** mit Prioritäten und Deadlines
- **Visuelle Fortschrittsbalken** und Statistiken
- **Projektfilterung** nach Status (aktiv, geplant, archiviert)
- **Detaillierte Projektansichten** mit allen relevanten Informationen

### 🤖 AI-Planner
- **KI-gestützter Chat-Assistent** (powered by Groq SDK)
- **Intelligente Zeitplanung** und Task-Priorisierung
- **Timeline-Ansicht** für tägliche Planung
- **Kalender-Integration** mit visueller Darstellung
- **Deutsche Lokalisierung** aller AI-Funktionen

### 🎨 Content Creation
- **Interaktive Content-Erstellung** für verschiedene Formate
  - Blog-Posts
  - Videos
  - Social Media
  - Newsletter
  - Dokumente
  - Podcasts
- **Template-System** für schnellere Erstellung
- **AI-Canvas (Void)** für kreative Visualisierung
- **Live-Vorschau** während der Erstellung

### 📊 Resources & Analytics
- **Ressourcen-Überwachung** (Zeit, Energie, Fokus, Kreativität)
- **Visuelle Gauges** mit D3.js für Metriken
- **Fortschritts-Tracking** über Zeit
- **Performance-Statistiken**

### 🎮 Gamification
- **XP-System** mit Level-Progression
- **Achievement-System** für erledigte Aufgaben
- **Visuelle Belohnungen** und Fortschrittsanzeigen
- **Motivierende UI-Elemente**

### 🎨 Premium UI/UX
- **Moderne Glassmorphism-Designs**
- **Smooth Animations** mit GSAP und Framer Motion
- **Spotlight-Effekte** auf interaktiven Karten
- **Dark Mode** optimiert
- **Responsive Design** für alle Geräte
- **Interaktive 3D-Effekte**

## 🛠️ Technologie-Stack

### Frontend
- **[Next.js 16.1.1](https://nextjs.org/)** - React Framework mit App Router
- **[React 19.2.3](https://react.dev/)** - UI Library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type Safety
- **[TailwindCSS 4.1.18](https://tailwindcss.com/)** - Utility-First CSS

### Animationen & Interaktivität
- **[Framer Motion 12.26.2](https://www.framer.com/motion/)** - React Animation Library
- **[GSAP 3.14.2](https://greensock.com/gsap/)** - Professional Animation Platform
- **[D3.js 7.9.0](https://d3js.org/)** - Data Visualization

### State Management & UI
- **[Zustand 5.0.10](https://zustand-demo.pmnd.rs/)** - State Management
- **[Lucide React 0.562.0](https://lucide.dev/)** - Icon Library
- **[Recharts 3.6.0](https://recharts.org/)** - Chart Library
- **[Sonner 2.0.7](https://sonner.emilkowal.ski/)** - Toast Notifications
- **[clsx 2.1.1](https://github.com/lukeed/clsx)** - Conditional Classnames

### AI Integration
- **[Groq SDK 0.37.0](https://groq.com/)** - AI Chat Integration

### Development Tools
- **[ESLint](https://eslint.org/)** - Code Linting
- **[PostCSS](https://postcss.org/)** - CSS Processing
- **[Autoprefixer](https://github.com/postcss/autoprefixer)** - CSS Vendor Prefixes

## 📦 Installation

### Voraussetzungen
- **Node.js** 20.x oder höher
- **npm** oder **yarn** oder **pnpm**
- **Git** für Versionskontrolle

### Schritt-für-Schritt-Anleitung

1. **Repository klonen**
```bash
git clone https://github.com/justinhaelsig02/personal-cms.git
cd personal-cms
```

2. **Dependencies installieren**
```bash
npm install
# oder
yarn install
# oder
pnpm install
```

3. **Umgebungsvariablen konfigurieren**

Erstelle eine `.env.local` Datei im Root-Verzeichnis:

```env
# Groq API für AI-Chat
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here

# Optional: Weitere API-Keys
# NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

4. **Development Server starten**
```bash
npm run dev
# oder
yarn dev
# oder
pnpm dev
```

5. **Browser öffnen**

Navigiere zu [http://localhost:3000](http://localhost:3000)

## 🚀 Entwicklung

### Verfügbare Scripts

```bash
# Development Server starten
npm run dev

# Production Build erstellen
npm run build

# Production Server starten
npm start

# Code Linting
npm run lint
```

### Development Workflow

1. **Hot Reload**: Änderungen werden automatisch im Browser aktualisiert
2. **TypeScript**: Volle Type-Safety während der Entwicklung
3. **ESLint**: Automatische Code-Quality-Checks
4. **Fast Refresh**: React Fast Refresh für komponentenbasierte Updates

## 📂 Projektstruktur

```
personal-cms/
├── src/
│   ├── app/                    # Next.js App Router Pages
│   │   ├── page.tsx            # Mission Control (Dashboard)
│   │   ├── planner/            # AI-Planner Page
│   │   ├── projects/           # Projektmanagement
│   │   ├── creation/           # Content Creation
│   │   ├── resources/          # Ressourcen-Übersicht
│   │   ├── profile/            # Benutzerprofil
│   │   ├── layout.tsx          # Root Layout
│   │   └── globals.css         # Globale Styles
│   │
│   ├── components/             # React Components
│   │   ├── layout/             # Layout-Komponenten (Sidebar, MainContent)
│   │   ├── dashboard/          # Dashboard-Komponenten
│   │   ├── planner/            # Planner-Komponenten (ChatInterface, Timeline, Calendar)
│   │   ├── projects/           # Projekt-Komponenten
│   │   ├── creation/           # Content-Creation-Komponenten
│   │   ├── resources/          # Ressourcen-Komponenten
│   │   ├── gamification/       # XP-System, Achievements
│   │   ├── void/               # AI Canvas
│   │   └── ui/                 # Wiederverwendbare UI-Komponenten
│   │
│   └── lib/                    # Utilities & Stores
│       ├── projects.ts         # Projekt-State (Zustand)
│       ├── tasks.ts            # Task-State (Zustand)
│       ├── planner.ts          # Planner-State (Zustand)
│       ├── gamification.ts     # XP & Level-System
│       ├── ui-store.ts         # UI-State Management
│       └── gsap.ts             # GSAP Konfiguration
│
├── public/                     # Statische Assets
│   ├── favicon.ico
│   └── images/
│
├── .env.local                  # Umgebungsvariablen (nicht in Git)
├── .gitignore
├── next.config.ts              # Next.js Konfiguration
├── tailwind.config.ts          # TailwindCSS Konfiguration
├── tsconfig.json               # TypeScript Konfiguration
├── package.json
└── README.md
```

## ⚙️ Konfiguration

### TailwindCSS
Das Projekt verwendet **TailwindCSS v4** mit benutzerdefiniertem Theme:
- Custom Color Palette (Primary, Accent, Muted)
- Glassmorphism Utilities
- Custom Animations
- Responsive Breakpoints

### TypeScript
Strikte TypeScript-Konfiguration für maximale Type-Safety:
- Strict Mode aktiviert
- Path Aliases (`@/` für `src/`)
- Incremental Compilation

### Next.js
Optimiert für Performance:
- App Router (neueste Next.js Features)
- Image Optimization
- Font Optimization (Geist Font)
- Automatic Code Splitting

## 🌐 Deployment

### Vercel (Empfohlen)

1. **Vercel Account** erstellen auf [vercel.com](https://vercel.com)
2. **Repository verbinden**
3. **Umgebungsvariablen** hinzufügen
4. **Deploy** klicken

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/justinhaelsig02/personal-cms)

### Alternative Deployment-Optionen

- **Netlify**: Ähnlich wie Vercel
- **Docker**: Containerisierte Deployment
- **Node.js Server**: Selbst-gehostet mit `npm run build && npm start`

### Environment Variables für Production

Stelle sicher, dass alle notwendigen Umgebungsvariablen in deiner Deployment-Plattform konfiguriert sind:
- `NEXT_PUBLIC_GROQ_API_KEY`
- Weitere API-Keys nach Bedarf

## 🤝 Contributing

Beiträge sind willkommen! Bitte erstelle einen Pull Request oder öffne ein Issue für Vorschläge.

### Development Guidelines
1. **Branch** für neue Features erstellen
2. **TypeScript** und **ESLint** Regeln befolgen
3. **Commit Messages** sollten aussagekräftig sein
4. **Tests** schreiben (falls verfügbar)

## 📝 Lizenz

Dieses Projekt ist privat und für persönliche Nutzung gedacht.

**Autor**: Justin H.  
**Email**: justinhaelsig02@gmail.com  
**GitHub**: [@justinhaelsig02](https://github.com/justinhaelsig02)

---

## 🎯 Roadmap

### Geplante Features
- [ ] Backend-Integration mit Datenbank
- [ ] User Authentication
- [ ] Team Collaboration Features
- [ ] Export-Funktionen (PDF, Markdown)
- [ ] Mobile App (React Native)
- [ ] Erweiterte AI-Funktionen
- [ ] Plugin-System
- [ ] Theme Customization

### In Entwicklung
- [x] AI-Chat Lokalisierung (Deutsch)
- [x] Kalender-Integration 
- [x] Gamification-System
- [x] Content Creation Templates

---

**Made with ❤️ and AI** | Powered by Next.js, React & TailwindCSS
