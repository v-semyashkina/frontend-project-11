import { main } from '@popperjs/core'
import { object, string } from 'yup'
import watchState from './view.js'

const initialState = {
  urls: [],
  form: {
    state: {},
    isValid: false,
    error: '',
  },
}

const schema = object().shape({
  newUrl: string('Ссылка должна быть валидным URL')
    .required('Ссылка должна быть валидным URL')
    .url('Ссылка должна быть валидным URL')
    .test('not-in-urls', 'RSS уже существует', function (value) {
      const { urls } = this.parent
      return !urls.includes(value)
    }),
})

const validateUrl = () => {
  const form = document.querySelector('.rss-form')
  const input = document.querySelector('#url-input')

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const newUrl = input.value.trim()
    const dataToValidate = { newUrl, urls: state.urls }
    schema
      .validate(dataToValidate, { abortEarly: false })
      .then(() => {
        Object.assign(state, { urls: [...state.urls, newUrl] })
        Object.assign(state.form, { error: '', isValid: true })
        form.reset()
      })
      .catch((e) => {
        const message = e.errors[0]
        Object.assign(state.form, { error: message, isValid: false })
      })
  })
}

const state = watchState(initialState)

export default validateUrl
