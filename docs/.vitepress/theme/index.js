import DefaultTheme from 'vitepress/theme'
import { defineComponent, h, nextTick, ref, watch } from 'vue'
import { useData } from 'vitepress'
import './custom.css'

function calculateReadingTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 120))

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

        const text = article.textContent || ''
        label.value = calculateReadingTime(text)
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