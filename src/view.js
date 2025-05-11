import onChange from 'on-change'
import i18n from 'i18next'
import ru from './locales/ru.js'

i18n.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru,
  },
})
const watchState = (state) => {
  const processForm = () => {
    const input = document.querySelector('#url-input')
    const feedback = document.querySelector('.feedback')
    if (state.form.isValid) {
      input.classList.remove('is-invalid')
      feedback.textContent = ''
    }
    if (!state.form.isValid) {
      input.classList.add('is-invalid')
      feedback.textContent = i18n.t(`form.errors.${state.form.error}`)
    }
  }

  return onChange(state, processForm)
}

export default watchState
