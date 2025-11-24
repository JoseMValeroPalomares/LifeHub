<div align="center">

# 🌌 NexusOS v6.0

[![React](https://img.shields.io/badge/React-18.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

<p align="center">
  <strong>NexusOS</strong> es una mega aplicación web que centraliza la gestión de vida, finanzas, estudios y salud en una interfaz futurista y minimalista.
</p>

</div>

---

## 🚀 Guía de Instalación Rápida

Sigue estos pasos para descargar y ejecutar **NexusOS** en tu ordenador en menos de 2 minutos.

### 📋 Prerrequisitos

Antes de empezar, asegúrate de tener instalado **Node.js** (versión 16 o superior).

> [Descargar Node.js aquí](https://nodejs.org/)

---

### ⚡️ Paso a paso

**1. Clonar el repositorio**
Abre tu terminal (o consola de comandos) y ejecuta:

```bash
git clone https://github.com/TU_USUARIO/nexus-os.git
cd nexus-os
```


**2. Instalar las dependencias**
Esto descargará todas las librerías necesarias automáticamente:
```bash
npm install
```


**3. Configurar la IA (Opcional)**
Para activar las funciones inteligentes, necesitas una API Key gratuita de Google Gemini.

> [Consíguela aquí: Google AI Studio](https://aistudio.google.com/app/)

Pega tu clave dentro en `src/App.jsx`:

``const apiKey = "TU_API_KEY_AQUI";``


**4. Iniciar el servidor de desarrollo**
Ejecuta este comando para encender la aplicación:

```bash
npm run dev
```

**5. ¡Listo! Abre tu navegador**
Entra en la URL que aparece en tu terminal (normalmente):

> http://localhost:5173/

---

## 🛠️ Módulos Incluidos

| Módulo | Descripción | Tecnología Clave |
| :--- | :--- | :--- |
| **🧘 LifeHub** | Gestión de tareas con rollover automático y Modo Zen. | `localStorage`, `Date Logic` |
| **💸 MoneyFlow** | Finanzas personales, control de deudas y metas inteligentes. | `Recharts`, `Math Logic` |
| **🎓 StudyMaster** | Calculadora de notas, calendario académico y Tutor IA. | `Gemini API`, `Custom Calendar` |
| **🩺 MyHealth** | Tracking de salud, sueño y métricas vitales. | `Data Visualization` |

---

## ✨ Características Destacadas

### 🧘 **LifeHub - Productividad Extrema**
- Sistema de tareas con "rollover" automático (las pendientes pasan al día siguiente).
- **Modo Zen:** Interfaz minimalista sin distracciones.
- **AI Coach:** Sugerencias inteligentes para optimizar tu rutina.

### 💸 **MoneyFlow - Control Financiero**
- Seguimiento de patrimonio neto, efectivo y deudas.
- **Metas Inteligentes:** Algoritmo que ajusta incrementos según el objetivo restante.
- Gestión visual sin inputs numéricos molestos.

### 🎓 **StudyMaster - Gestión Académica Pro**
- **Calculadora de Notas Real:** Configura pesos (% Teoría vs Práctica).
- **AI Tutor por Asignatura:** Chatbot contextual para resolver dudas.
- **Calendario Full-Size:** Vista mensual con títulos y colores de eventos.

### 🩺 **MyHealth - Salud & Bienestar**
- Monitor de hidratación, sueño y calorías.
- Panel de métricas vitales con visualización gráfica.

---

## 📦 Tecnologías Utilizadas

- **Frontend:** React 18 + Vite
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Gráficos:** Recharts
- **IA:** Google Gemini API
- **Persistencia:** LocalStorage (Custom Hooks)

---

## 🗺️ Roadmap

- [x] 4 módulos principales integrados.
- [x] Persistencia local con LocalStorage.
- [x] Integración con IA (Gemini).
- [ ] Sincronización en la nube (Firebase/Supabase).
- [ ] Versión PWA instalable en móvil.
- [ ] Exportación de reportes en PDF.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar NexusOS:

1. Haz un **Fork** del proyecto.
2. Crea una rama para tu feature: `git checkout -b feature/MiFeature`.
3. Haz commit de tus cambios: `git commit -m 'Añadida nueva funcionalidad'`.
4. Sube a tu rama: `git push origin feature/MiFeature`.
5. Abre un **Pull Request**.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">
  <sub>Desarrollado con ❤️ por [Tu Nombre]</sub>
</div>



