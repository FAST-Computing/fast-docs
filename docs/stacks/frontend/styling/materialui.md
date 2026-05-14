---
outline: deep
---

# <img src="/logos/materialuilogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px"> Material UI

Material UI is an open-source React component library that implements Google's Material Design. It's comprehensive and can be used in production out of the box.

It includes a comprehensive collection of prebuilt components that are ready for use in production right out of the box and features a suite of customization options that make it easy to implement your own custom design system on top of our components.

## Installation

To get started, you need to install the core library and the emotion engine (which MUI uses for styling), along with the icon set.

::: code-group

```bash
npm install @mui/material @emotion/react @emotion/styled
```

:::


## Basic Concepts

Material UI works by wrapping your application in a `ThemeProvider` (optional but recommended) and using a `CssBaseline` component to normalize styles across browsers.

<iframe src="https://codesandbox.io/embed/p76vks?view=editor+preview&module=/src/App.tsx&fontsize=13&hidenavigation=1"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="mui-test"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>


The `sx` prop is a powerful shorthand for defining custom styles directly on a component. It allows you to access your theme's design tokens, such as spacing, colors, and breakpoints, directly from the component.

Instead of using standard `<h1>` or `<p>` tags, MUI uses the **Typography** component. The variant prop changes the visual style (e.g., h1, body1), while the component prop changes the underlying HTML element.

Material UI provides three primary layout components that work together to structure your application:
- The **Container** acts as the outermost layer, automatically centering your content horizontally and applying padding to ensure your UI doesn't hit the edges of the screen.
- Inside that, you often use the **Box**, which serves as a versatile "super-div" designed for quick styling; it allows you to apply margins, colors, and borders directly through props without writing separate CSS. 
- To manage the flow between specific elements, like a row of buttons or a column of text, the **Stack** component handles the distribution and spacing, acting as a flexbox container that ensures consistent gaps between every child element.

---

One of MUI's strongest features is the ability to change the look of the entire app globally.

<iframe src="https://codesandbox.io/embed/p76vks?view=editor+%2B+preview&module=%2Fsrc%2Findex.tsx&fontsize=13&hidenavigation=1"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="mui-test"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

---




## Usage

For more information about deeper usage and components, see: https://mui.com/material-ui/getting-started/usage/

