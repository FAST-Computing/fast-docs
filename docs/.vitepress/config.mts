import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "FAST-Docs",
  description: "FAST Computing - documentation & standards",
  base: '/fast-docs/',
  lastUpdated: true,

  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [
        groupIconVitePlugin({
          customIcon: {
            '.py': 'vscode-icons:file-type-python',
            'python': 'vscode-icons:file-type-python',
          },
        })
      ],
  },

  themeConfig: {
    logo: '/fast_logo_orange.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'ATLAS', link: 'https://atlas.sissa.it/' },
      { text: 'ARGOS', link: 'https://argos.sissa.it/' },
      { text: 'Home', link: '/' },
    ],
    search: {
      provider: 'local',
    },
    editLink: {
      pattern: 'https://github.com/FAST-Computing/fast-docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    sidebar: [
      {
        text: 'Setup',
        collapsed: false,
        items: [
          {
            text: 'Operating Systems',
            collapsed: true,
            items: [
              { text: 'Arch Linux', link: '/setup/os/arch_linux' },
            ]
          },
          {
            text: 'Package Managers',
            collapsed: true,
            items: [
              { text: 'uv', link: '/setup/package-managers/uv' },
              { text: 'micromamba', link: '/setup/package-managers/micromamba' },
              { text: 'npm', link: '/setup/package-managers/npm' },
            ]
          },
        ]
      },
      {
        text: 'Tools',
        collapsed: false,
        items: [
          {
            text: 'Coding',
            collapsed: true,
            items: [
              { text: 'VSCode', link: '/tools/coding/vscode' },
              { text: 'Git / GitHub', link: '/tools/coding/git' },
              { text: 'Docker', link: '/tools/coding/docker' },
            ]
          },
          {
            text: 'Productivity',
            collapsed: true,
            items: [
              { text: 'Slack', link: '/tools/productivity/slack' },
              { text: 'GoodDay', link: '/tools/productivity/goodday' },
            ]
          },
          {
            text: 'Specialized',
            collapsed: true,
            items: [
              { text: 'Paraview', link: '/tools/specialized/paraview' },
            ]
          },
        ]
      },
      {
        text: 'Stacks',
        collapsed: false,
        items: [
          {
            text: 'Backend',
            collapsed: true,
            items: [
              { text: 'Python',
                collapsed: true,
                items: [
                  { text: 'Pydantic', link: '/stacks/backend/python/pydantic' },
                  { text: 'FastAPI', link: '/stacks/backend/python/fastapi' },
                  { text: 'Numpy', link: '/stacks/backend/python/numpy' },
                ]
              },
              { text: 'Databases',
                collapsed: true,
                items: [
                  { text: 'PostgreSQL', link: '/stacks/backend/databases/postgresql' },
                ]
              },
            ]
          },
          {
            text: 'Frontend',
            collapsed: true,
            items: [
              {
                text: 'Frameworks', 
                collapsed: true, 
                items: [
                  { text: 'NextJS', link: '/stacks/frontend/frameworks/nextjs' },
                ]
              },
              {
                text: 'Styling',
                collapsed: true,
                items: [
                  { text: 'MaterialUI', link: '/stacks/frontend/styling/materialui' },
                  { text: 'TailwindCSS', link: '/stacks/frontend/styling/tailwindcss' },
                ]
              },
              
            ]
          },
        ],
      },
      {
        text: 'Services',
        collapsed: false,
        items: [
          {
            text: 'VPN',
            collapsed: true,
            items: [
              { text: 'SISSA VPN', link: '/services/vpn/sissavpn' },
              { text: 'Wireguard', link: '/services/vpn/wireguard' },
            ]
          },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/FAST-Computing' },
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><title>Website</title><path d="M5 4.5 12.5 12 5 19.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/><path d="M11.5 4.5 19 12l-7.5 7.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/></svg>'
        },
        link: 'https://fastcomputing.net',
        ariaLabel: 'Website'
      }
    ]
  }
})
