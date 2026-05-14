---
outline: deep
---

# <img src="/logos/tailwindcsslogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px"> TailwindCSS

Tailwind CSS is a utility-first CSS framework that allows you to build custom designs directly in your HTML by applying pre-defined classes. Instead of writing traditional CSS in a separate stylesheet, you use classes like `flex`, `pt-4`, and `text-center`. Traditional CSS requires you to name classes (like `.card-container`) and define styles. In Tailwind, you apply small, single-purpose utility classes directly to elements.

## Installation

### Fresh Next.JS setup

The framework can be automatically installed during the setup of every new [Next.JS](../frameworks/nextjs) project.

```sh
npx create-next-app@latest my-project --typescript --eslint --app
cd my-project
```

### Existing project

**1. Install dependencies**

```sh
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**2. Configure your template paths**

Open the newly created tailwind.config.js file. You need to tell Tailwind which files to "scan" for class names so it knows which styles to generate.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using the `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**3. Add Tailwind directives to your CSS**

Find your global CSS file (usually app/globals.css in the App Router or styles/globals.css in the Pages Router). Replace the content with these three lines:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```


## Basic Concepts

Instead of writing CSS rules, you compose layouts using a standardized set of "building blocks."

<iframe src="https://codesandbox.io/embed/l9fnqt?view=editor+%2B+preview&module=%2Fsrc%2FApp.tsx&fontsize=13&hidenavigation=1"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="tailwind-test"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

### Box Model & Spacing

Tailwind uses a numeric scale for spacing (padding, margin, width, height). For example, 4 translates to 1rem (16px). This ensures your UI stays perfectly proportional.
- Margin/Padding: `m-4`, `pt-2` (padding-top), `px-8` (padding left & right).
- Sizing: `w-full` (100% width), `h-screen` (100% viewport height).

### Responsive Design

Tailwind uses a mobile-first approach. You apply classes for mobile by default, then use "breakpoints" to change them for larger screens.
- `text-sm` `md:text-lg` `lg:text-xl` (Small on mobile, large on tablets, extra-large on desktop).

### Hover, Focus, and Active States

You can style any element on interaction by prefixing the class with the state.
- `bg-blue-500` `hover:bg-blue-700` (Changes color on hover).
- `border-gray-300` `focus:border-blue-500` (Changes border when clicked/focused).


## Usage

For more information about deeper usage and components, see: https://tailwindcss.com/docs/styling-with-utility-classes