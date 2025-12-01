# Pelon Club dApp

dApp de Next.js para Pelon Club, una plataforma de recursos educativos con token gating y red social para estudiantes. Desarrollada por Baeza.eth (King Of The Pelones).

## Descripción

Pelon Club es una aplicación descentralizada que permite monetizar conocimiento a través de recursos educativos protegidos por tokens y actividades token gated. La plataforma también funciona como una red social para estudiantes, facilitando la conexión y el aprendizaje colaborativo.

## Stack Tecnológico

### Framework y Core
- **Next.js 15** - Framework React con SSR y exportación estática
- **React 19** - Biblioteca UI
- **TypeScript 5.5** - Tipado estático

### Blockchain y Web3
- **wagmi 2.17** - Hooks de React para Ethereum
- **RainbowKit 2.2** - Componentes UI para conexión de wallets
- **viem 2.40** - Cliente TypeScript para Ethereum
- **Base** - Blockchain L2 de Ethereum (red principal)

### Estilos y UI
- **Tailwind CSS 4.1** - Framework de utilidades CSS
- **@tailwindcss/postcss 4.1** - Plugin PostCSS para Tailwind v4
- **Sistema de Diseño Neobrutalism** - Estética audaz con tema Indigo Dark

### Internacionalización
- **next-intl 4.5** - Internacionalización para Next.js
- **Idiomas**: Español (default), Inglés

### Utilidades
- **react-hot-toast 2.6** - Notificaciones toast
- **recharts 2.15** - Gráficos y visualizaciones
- **react-icons 5.5** - Iconos
- **class-variance-authority** - Variantes de componentes
- **clsx & tailwind-merge** - Utilidades para clases CSS

## Características Principales

- 🔗 **Conexión de Wallet**: Integración completa con RainbowKit para conectar wallets de Ethereum
- 🎨 **Sistema de Diseño Neobrutalism**: Estética audaz con sombras duras, bordes gruesos y colores contrastantes
- 🌍 **Internacionalización**: Soporte completo para español e inglés con next-intl
- 📊 **Leaderboard**: Sistema de clasificación y estadísticas
- 💎 **Tokenomics**: Visualización de la economía del token
- 🚀 **Token Sale**: Interfaz para compra de tokens
- 📱 **Responsive Design**: Diseño adaptativo para móviles, tablets y desktop
- ⚡ **Exportación Estática**: Build optimizado para hosting estático

## Instalación y Configuración

### Requisitos Previos

- Node.js 18+ 
- npm o yarn
- WalletConnect Project ID (obtener en [cloud.walletconnect.com](https://cloud.walletconnect.com))

### Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd dapp
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:

Crear un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus valores:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_project_id_aqui
NEXT_PUBLIC_PELON_TOKEN_ADDRESS=direccion_del_token
NEXT_PUBLIC_USDC_ADDRESS=direccion_usdc
NEXT_PUBLIC_TOKEN_SALE_ADDRESS=direccion_token_sale
```

### Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ID del proyecto de WalletConnect | ✅ Sí |
| `NEXT_PUBLIC_PELON_TOKEN_ADDRESS` | Dirección del contrato del token Pelon | Opcional |
| `NEXT_PUBLIC_USDC_ADDRESS` | Dirección del contrato USDC | Opcional |
| `NEXT_PUBLIC_TOKEN_SALE_ADDRESS` | Dirección del contrato de venta de tokens | Opcional |

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo en http://localhost:3000

# Build
npm run build        # Construye la aplicación para producción (exportación estática)

# Producción
npm start            # Inicia el servidor de producción (requiere build previo)
```

## Estructura del Proyecto

```
dapp/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Leaderboard/     # Componentes del leaderboard
│   │   ├── SEO/             # Componentes de SEO y metadata
│   │   ├── Tokenomics/      # Componentes de tokenomics
│   │   ├── TokenSale/       # Componentes de venta de tokens
│   │   ├── LanguageSelector.tsx
│   │   ├── Navigation.tsx
│   │   └── SocialIcons.tsx
│   ├── contracts/           # Definiciones de contratos inteligentes
│   │   ├── pelonClubToken.ts
│   │   ├── tokenSale.ts
│   │   └── usdc.ts
│   ├── data/                # Datos estáticos y configuraciones
│   ├── hooks/               # Custom hooks de React
│   ├── i18n/                # Configuración de internacionalización
│   │   ├── config.ts
│   │   ├── request.ts
│   │   └── routing.ts
│   ├── lib/                 # Utilidades y helpers
│   │   ├── seo.ts
│   │   └── utils.ts
│   ├── messages/            # Archivos de traducción
│   │   ├── es.json
│   │   └── en.json
│   ├── pages/               # Páginas de Next.js
│   │   ├── [locale]/        # Páginas con internacionalización
│   │   │   ├── index.tsx
│   │   │   ├── leaderboard.tsx
│   │   │   ├── tokenomics.tsx
│   │   │   └── token-sale.tsx
│   │   └── _app.tsx
│   ├── styles/              # Estilos globales
│   │   └── globals.css      # Tailwind CSS v4 y tema Neobrutalism
│   └── wagmi.ts             # Configuración de wagmi
├── public/                  # Archivos estáticos
├── components.json          # Configuración de shadcn/ui
├── next.config.js           # Configuración de Next.js
├── postcss.config.js        # Configuración de PostCSS
├── tailwind.config.js       # Configuración de Tailwind CSS
├── tsconfig.json            # Configuración de TypeScript
└── package.json             # Dependencias y scripts
```

## Sistema de Diseño

El proyecto utiliza un **Sistema de Diseño Neobrutalism** con un **tema Indigo Dark**. Las características principales incluyen:

### Principios Neobrutalistas
- **Sombras Duras**: Sombras definidas y angulares (`4px 4px 0px` en negro)
- **Bordes Gruesos**: Bordes sólidos de 3px o 4px en negro
- **Colores Audaces**: Paleta vibrante y contrastante
- **Sin Bordes Redondeados**: Esquinas afiladas (`border-radius: 0px`)
- **Tipografía Bold**: Font-weight 700 para títulos y elementos destacados
- **Alto Contraste**: Contraste extremo para legibilidad

### Paleta de Colores (Tema Indigo Dark)

- **Fondo Principal**: `#0f172a` (slate-900)
- **Fondo Secundario**: `#1e293b` (slate-800)
- **Texto Principal**: `#f1f5f9` (slate-100)
- **Texto Secundario**: `#cbd5e1` (slate-300)
- **Color Primario**: `#4338ca` (indigo-700)
- **Color Primario Hover**: `#4f46e5` (indigo-600)
- **Color Primario Active**: `#3730a3` (indigo-800)

### Utilidades Neobrutalistas

El proyecto incluye clases utilitarias personalizadas definidas en `src/styles/globals.css`:

- `.shadow-neobrutal` - Sombra estándar (4px 4px 0px)
- `.shadow-neobrutal-sm` - Sombra pequeña (2px 2px 0px)
- `.shadow-neobrutal-md` - Sombra mediana (6px 6px 0px)
- `.shadow-neobrutal-lg` - Sombra grande (8px 8px 0px)
- `.border-neobrutal` - Borde estándar (3px sólido negro)
- `.border-neobrutal-thick` - Borde grueso (4px sólido negro)
- `.rounded-neobrutal` - Sin bordes redondeados (0px)

Para más detalles sobre el sistema de diseño, consulta la documentación completa en las reglas del workspace.

## Desarrollo

### Estructura de Rutas con i18n

El proyecto utiliza `next-intl` para internacionalización. Las rutas siguen el patrón:

```
/[locale]/[page]
```

Ejemplos:
- `/es` - Home en español
- `/en` - Home en inglés
- `/es/leaderboard` - Leaderboard en español
- `/en/tokenomics` - Tokenomics en inglés

El locale por defecto es `es` (español).

### Páginas Disponibles

- **Home** (`/[locale]/index.tsx`) - Página principal con bento cards
- **Leaderboard** (`/[locale]/leaderboard.tsx`) - Clasificación y estadísticas
- **Tokenomics** (`/[locale]/tokenomics.tsx`) - Economía del token
- **Token Sale** (`/[locale]/token-sale.tsx`) - Interfaz de compra de tokens

### Componentes Principales

- **Navigation** - Navegación principal con selector de idioma y conexión de wallet
- **LanguageSelector** - Selector de idioma (ES/EN)
- **SocialIcons** - Iconos de redes sociales
- **Metadata** - Componente SEO para metadata dinámica

## Build y Exportación Estática

El proyecto está configurado para exportación estática (`output: 'export'` en `next.config.js`). Esto significa que:

1. El build genera archivos HTML estáticos en la carpeta `out/`
2. No requiere un servidor Node.js para funcionar
3. Puede ser desplegado en cualquier hosting estático (Vercel, Netlify, GitHub Pages, etc.)

Para construir la aplicación:

```bash
npm run build
```

Los archivos estáticos se generarán en la carpeta `out/`.

## Deployment

### Preparación para Producción

1. Asegúrate de tener todas las variables de entorno configuradas en tu plataforma de hosting
2. El build genera archivos estáticos en `out/`
3. Configura las variables de entorno en tu plataforma de hosting

### Variables de Entorno en Producción

Configura las siguientes variables de entorno en tu plataforma de hosting:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_PELON_TOKEN_ADDRESS` (opcional)
- `NEXT_PUBLIC_USDC_ADDRESS` (opcional)
- `NEXT_PUBLIC_TOKEN_SALE_ADDRESS` (opcional)

### Plataformas Recomendadas

- **Vercel**: Deploy automático desde Git, soporte nativo de Next.js
- **Netlify**: Deploy automático, soporte para sitios estáticos
- **GitHub Pages**: Hosting gratuito para sitios estáticos
- **Cloudflare Pages**: Hosting rápido y global

## Recursos y Referencias

### Documentación Oficial

- [Next.js Documentation](https://nextjs.org/docs) - Documentación de Next.js
- [RainbowKit Documentation](https://rainbowkit.com) - Documentación de RainbowKit
- [wagmi Documentation](https://wagmi.sh) - Documentación de wagmi
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Documentación de Tailwind CSS
- [next-intl Documentation](https://next-intl-docs.vercel.app/) - Documentación de next-intl
- [viem Documentation](https://viem.sh) - Documentación de viem

### Recursos Adicionales

- [Base Blockchain](https://base.org) - Documentación de Base
- [WalletConnect Cloud](https://cloud.walletconnect.com) - Obtener Project ID
- [Neobrutalism Design](https://www.neobrutalism.dev/) - Referencia de diseño Neobrutalism

## Licencia

Este proyecto es privado y propiedad de Baeza.eth (King Of The Pelones).

---

**Desarrollado por**: Baeza.eth (King Of The Pelones)  
**Versión**: 0.1.0
