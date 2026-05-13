---
outline: deep
---

# <img src="/logos/nextlogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px"> NextJS

Next.js is a powerful framework built on top of React that simplifies building full-stack web applications by handling routing, rendering, and performance optimizations out of the box.

## Basic Usage

To be able to use it, ensure you have Node.js 20.9 or later installed.

This is how you can create a new project:

```bash
npx create-next-app@latest <app_name> --yes
cd <app_name>
npm run dev
```

During setup, you can confirm using TypeScript, TailwindCSS, AppRouter and import alias.

From this on, you can refer to [npm](../../../setup/package-managers/npm).


## Core Concepts

### Server vs. Client Components

By default, every file in the app directory is a Server Component.
- *Server Components*: Fetch data closer to the source and keep large dependencies on the server, resulting in faster page loads.
- *Client Components*: Use the "use client" directive at the top of the file. These are for interactivity (e.g., useState, useEffect, or clicking buttons).

### File-Based Routing

Next.js uses a folder-based system to define routes:
- `app/page.tsx` → Maps to `/`
- `app/about/page.tsx` → Maps to `/about`
- `app/blog/[slug]/page.tsx` → Maps to dynamic routes like `/blog/hello-world`

### Data Fetching 

Next.js simplifies how you handle data by allowing you to use async/await directly in your Server Components. You can fetch data directly in your component without needing a separate API route or useEffect.

```ts
// app/blog/page.tsx
export default async function Page() {
  const data = await fetch('https://api.example.com/posts');
  const posts = await data.json();
  
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### Optimization

Next.js includes built-in components that handle the heavy lifting of web performance:
- `<Image/>`: Automatically resizes, optimizes, and lazy-loads images.
- `<Link/>`: Handles prefetching of pages for near-instant navigation.
- `<Font/>`: Optimizes and hosts your web fonts locally to prevent layout shifts.