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
  newUrl: string('UrlInvalid')
    .required('UrlInvalid')
    .url('UrlInvalid')
    .test('not-in-urls', 'RssExists', function (value) {
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
