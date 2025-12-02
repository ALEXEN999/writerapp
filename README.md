# 📘 WriterApp  
**La herramienta definitiva para organizar tus historias.**  
React + Vite + Firebase, diseñada para escritores modernos.

---

<div align="center">

![Status](https://img.shields.io/badge/status-active-brightgreen)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-orange?logo=firebase&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)
![Deploy](https://img.shields.io/badge/GitHub%20Pages-deployed-green?logo=github)

</div>

---

## 🌟 Descripción

**WriterApp** es una aplicación web que permite gestionar historias, personajes, mundos, capítulos y más.  
Pensada especialmente para móviles, con soporte para **iPhone/iOS**, interfaz limpia y guardado en Firebase.

---

## 🚀 Características

- ✍️ Editor de historias con estructura narrativa  
- 🧩 Gestor de personajes con relaciones  
- 🌍 Sección de mundo / especies / magia  
- 🗂️ Sistema de capítulos y arcos narrativos  
- 📱 UI adaptada a móviles  
- 🔐 Inicio de sesión con Google  
- ☁️ Cloud sync con Firestore  
- ⚡ Render rápido con Vite  
- 🌐 Deploy automático a GitHub Pages  

---

## 🛠️ Tecnologías Usadas

- React  
- Vite  
- Firebase / Firestore  
- CSS moderno  
- gh-pages  

---

## 📦 Instalación Local

```bash
git clone https://github.com/ALEXEN999/writerapp
cd writerapp
npm install
npm run dev
```

Tu app estará en:

```
http://localhost:5173/
```

---

## 🚀 Deploy en GitHub Pages

Construir:

```bash
npm run build
```

Publicar:

```bash
npm run deploy
```

Tu sitio estará disponible en:  
👉 https://alexen999.github.io/writerapp/

> Si usas `/docs`, en GitHub → Settings → Pages selecciona `main` + `/docs`.

---

## 📁 Estructura del Proyecto

```
writerapp/
├── public/
├── src/
│   ├── components/
|   |   ├── entity/
|   |   ├── ui/
│   ├── styles/
│   ├── assets/
|   ├── utils/
|   ├── views/
│   └── App.jsx
├── vite.config.js
├── package.json
└── README.md
```

---

## 🔐 Autenticación

WriterApp usa **Google Sign In**.  
Usuarios no autenticados **no pueden** acceder al contenido.

---

## 🧪 Scripts Disponibles

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "gh-pages -d dist"
}
```

---

## 📝 Roadmap (Próximas funciones)

- 🔄 Sincronización multi-dispositivo mejorada  
- 🧠 IA para generación de ideas y resúmenes  
- 🎨 Temas personalizados  
- 🗃️ Exportación de historias en PDF / Markdown  
- 🔔 Notas rápidas desde el móvil  

---

## 🤝 Contribuciones

Si quieres colaborar:

1. Haz un fork  
2. Crea una rama nueva  
3. Envía un **pull request**  

---

<div align="center">

## 📬 Contacto

**Creado por Alejandro (ALEXEN999)**  
Sugerencias y mejoras → abre un *issue* o un PR.

✨ Gracias por usar WriterApp ✨

</div>
