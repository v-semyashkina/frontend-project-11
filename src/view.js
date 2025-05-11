import onChange from 'on-change'

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
      feedback.textContent = state.form.error
    }
  }

  return onChange(state, processForm)
}

export default watchState
