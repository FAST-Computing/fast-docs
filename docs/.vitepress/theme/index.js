import DefaultTheme from 'vitepress/theme'
import { defineComponent, h, nextTick, ref, watch } from 'vue'
import { useData } from 'vitepress'
import './custom.css'

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
        label.value ? `⏱ ${label.value}` : '⏱ calculating...',
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