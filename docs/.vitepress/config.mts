import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "FAST-Docs",
  description: "FAST Computing - documentation & standards",
  base: '/',
  themeConfig: {
    logo: '/fast_logo_orange.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],
    search: {
      provider: 'local'
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
            text: 'Python',
            collapsed: true,
            items: [
              { text: 'Pydantic', link: '/stacks/python/pydantic' },
              { text: 'FastAPI', link: '/stacks/python/fastapi' },
              { text: 'Numpy', link: '/stacks/python/numpy' },
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
                  { text: 'React', link: '/stacks/frontend/frameworks/react' },
                  { text: 'NextJS', link: '/stacks/frontend/nextjs' },
                ]
              },
              {
                text: 'Styling',
                collapsed: true,
                items: [
                  { text: 'MaterialUI', link: '/stacks/frontend/materialui' },
                  { text: 'TailwindCSS', link: '/stacks/frontend/tailwindcss' },
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
            ]
          },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/FAST-Computing' },
      { icon: 'website', link: 'https://fastcomputing.net' }
    ]
  }
})
