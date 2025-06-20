import onChange from 'on-change'
import { renderFeeds, renderPosts } from './render.js'

const watchState = (state, i18n, updateModal, addPostToSeen) => {
  const process = (path) => {
    const mainPath = path.split('.')[0]
    const form = document.querySelector('.rss-form')
    const input = document.querySelector('#url-input')
    const feedback = document.querySelector('.feedback')
    const submitBtn = form.querySelector('button')
    if (mainPath === 'form') {
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

    if (mainPath === 'loadingProcess') {
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
        form.reset()
      }
    }

    if (mainPath === 'feeds') {
      renderFeeds(state.feeds, i18n.t('feeds'))
    }

    if (mainPath === 'posts' || mainPath === 'seenPosts') {
      renderPosts(state, i18n.t('posts'), i18n.t('button'), updateModal, addPostToSeen)
    }

    if (mainPath === 'modal') {
      const modal = document.querySelector('#modal')
      const title = modal.querySelector('.modal-title')
      const description = modal.querySelector('.modal-body')
      const link = modal.querySelector('.full-article')
      title.textContent = state.modal.title
      description.textContent = state.modal.description
      link.href = state.modal.link
    }
  }

  return onChange(state, (path) => {
    process(path)
  })
}

export default watchState
