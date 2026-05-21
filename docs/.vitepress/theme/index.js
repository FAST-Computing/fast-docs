import DefaultTheme from 'vitepress/theme'
import { defineComponent, h, nextTick, ref, watch } from 'vue'
import { useData } from 'vitepress'
import './custom.css'

function renderReadingTimeIcon() {
  return h(
    'svg',
    {
      class: 'reading-time__icon',
      viewBox: '0 0 22 22',
      fill: 'currentColor',
      'aria-hidden': 'true',
    },
    [
      h('path', {
        d: 'M12 1.75A10.25 10.25 0 1 0 22.25 12 10.26 10.26 0 0 0 12 1.75Zm0 18.5A8.25 8.25 0 1 1 20.25 12 8.26 8.26 0 0 1 12 20.25Zm.75-13.5h-1.5V12c0 .24.12.46.32.6l3.75 2.5.83-1.25-3.4-2.27Z',
      }),
    ],
  )
}

function calculateReadingTime(article) {
  const clone = article.cloneNode(true)

  const codeBlocks = Array.from(clone.querySelectorAll('pre code, pre'))

  const codeLines = codeBlocks.reduce((total, block) => {
    const text = block.textContent || ''
    return total + text.split('\n').filter((line) => line.trim()).length
  }, 0)

  codeBlocks.forEach((block) => block.remove())

  const proseText = clone.textContent || ''
  const proseWords = proseText.trim().split(/\s+/).filter(Boolean).length

  const proseMinutes = proseWords / 120
  const codeMinutes = codeLines / 25

  const minutes = Math.max(1, Math.ceil(proseMinutes + codeMinutes))

  return `${minutes} min read`
}

const ReadingTime = defineComponent({
  name: 'ReadingTime',

  setup() {
    const { page } = useData()
    const label = ref('')

    const updateReadingTime = async () => {
      await nextTick()

      window.setTimeout(() => {
        const article = document.querySelector('.vp-doc')

        if (!article) {
          label.value = '1 min read'
          return
        }

          label.value = calculateReadingTime(article)
      }, 150)
    }

    watch(
      () => page.value.relativePath,
      updateReadingTime,
      { immediate: true },
    )

    return () =>
      h(
        'div',
        { class: 'reading-time' },
        label.value
          ? [renderReadingTimeIcon(), h('span', label.value)]
          : 'Calculating...',
      )
  },
})

export default {
  extends: DefaultTheme,

  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-top': () => h(ReadingTime),
    })
  },
}