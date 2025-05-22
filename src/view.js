import onChange from 'on-change'
import i18n from 'i18next'
import ru from './locales/ru.js'
import { renderFeeds, renderPosts } from './render.js'

i18n.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru,
  },
})

const watchState = (state) => {
  const process = (path) => {
    const pathRoot = path.split('.')[0]
    const form = document.querySelector('.rss-form')
    const input = document.querySelector('#url-input')
    const feedback = document.querySelector('.feedback')
    const submitBtn = form.querySelector('button')
    if (pathRoot === 'form') {
      if (state.form.isValid) {
        input.classList.remove('is-invalid')
        feedback.textContent = i18n.t(`form.errors.${state.form.error}`)
      }
      if (!state.form.isValid) {
        input.classList.add('is-invalid')
        feedback.classList.add('text-danger')
        feedback.classList.remove('text-success')
        feedback.textContent = i18n.t(`form.errors.${state.form.error}`)
      }
    }

    if (pathRoot === 'loadingProcess') {
      if (state.loadingProcess.state === 'failed') {
        feedback.textContent = i18n.t(`loadingProcess.errors.${state.loadingProcess.error}`)
        feedback.classList.add('text-danger')
        feedback.classList.remove('text-success')
        submitBtn.disabled = false
        input.readOnly = false
      }
      if (state.loadingProcess.state === 'loading') {
        submitBtn.disabled = true
        input.readOnly = true
      }
      if (state.loadingProcess.state === 'success') {
        feedback.textContent = i18n.t(`loadingProcess.success`)
        feedback.classList.remove('text-danger')
        feedback.classList.add('text-success')
        submitBtn.disabled = false
        input.readOnly = false
        renderFeeds(state.feeds, i18n.t('feeds'))
        renderPosts(state.posts, i18n.t('posts'), i18n.t('button'))
        form.reset()
      }
    }
  }

  return onChange(state, (path) => {
    process(path)
  })
}

export default watchState
