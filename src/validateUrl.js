import { main } from '@popperjs/core'
import { object, ref, string } from 'yup'
import axios from 'axios'
import { uniqueId, cloneDeep } from 'lodash'
import watchState from './view.js'
import parse from './parse.js'
import refresh from './refresh.js'

const initialState = {
  form: {
    isValid: false,
    error: '',
  },
  loadingProcess: {
    state: 'idle', // loading, success, failed
    error: '',
  },
  feeds: [],
  posts: [],
}
const proxyUrl = 'https://allorigins.hexlet.app/get?disableCache=true&url='

const schema = object().shape({
  newUrl: string('urlInvalid')
    .required('urlInvalid')
    .url('urlInvalid')
    .test('not-in-feeds', 'rssExists', function (value) {
      const { existingFeeds } = this.parent
      return !existingFeeds.includes(value)
    }),
})

const validateUrl = () => {
  const form = document.querySelector('.rss-form')
  const input = document.querySelector('#url-input')

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const newUrl = input.value.trim()
    const existingFeeds = state.feeds.map(feed => feed.feedLink)
    const dataToValidate = { newUrl, existingFeeds }
    schema
      .validate(dataToValidate, { abortEarly: false })
      .then(() => {
        Object.assign(state.form, { error: 'noError', isValid: true })
      })
      .then(() => {
        Object.assign(state.loadingProcess, { state: 'loading' })
        return axios.get(proxyUrl + newUrl)
      })
      .then((response) => {
        const responseStatus = response.data.status.http_code
        if (responseStatus !== 200) {
          Object.assign(state.loadingProcess, { state: 'failed', error: 'rssInvalid' })
        }
        else {
          const data = response.data.contents
          const parsedData = parse(data)
          const parseError = parsedData.getElementsByTagName('parsererror')
          if (parseError.length > 0) {
            Object.assign(state.loadingProcess, { state: 'failed', error: 'rssInvalid' })
          }
          else {
            const feedTitle = parsedData.getElementsByTagName('title')[0].textContent
            const feedDescription = parsedData.getElementsByTagName('description')[0].textContent
            const feedLink = newUrl
            const id = uniqueId()
            Object.assign(state.feeds, [
              ...state.feeds,
              { id, feedTitle, feedDescription, feedLink },
            ])
            const posts = Array.from(parsedData.getElementsByTagName('item'))
            const newPosts = cloneDeep(state.posts)
            posts.forEach((post) => {
              const postGuid = post.getElementsByTagName('guid')[0].textContent
              const postTitle = post.getElementsByTagName('title')[0].textContent
              const postLink = post.getElementsByTagName('link')[0].textContent
              const postId = uniqueId()
              Object.assign(newPosts, [
                ...newPosts,
                { id: postId, feedId: id, postTitle, postLink, postGuid },
              ])
            })
            Object.assign(state.posts, newPosts)
            Object.assign(state.loadingProcess, { state: 'success', error: 'noError' })
          }
        }
      })
      .then(() => {
        const feeds = state.feeds.map((feed) => {
          const id = feed.id
          const link = feed.feedLink
          return { id, link }
        })
        refresh(feeds)
      })
      .catch((e) => {
        if (e.name === 'AxiosError') {
          Object.assign(state.loadingProcess, { state: 'failed', error: 'networkError' })
        }
        else {
          console.log(e)
          const message = e.errors[0]
          Object.assign(state.form, { error: message, isValid: false })
        }
      })
  })
}

// const refresh = () => {
//   console.log('hiya');
//   const { feeds, posts } = state;
//   Promise.all(
//     feeds.map((feed) => {
//       const oldPostsGuids = posts
//         .filter((post) => post.feedId === feed.id)
//         .map((post) => post.postGuid);
//       axios
//         .get(proxyUrl + feed.feedLink)
//         .then((response) => {
//           const data = response.data.contents;
//           const parsedData = parse(data);
//           const posts = Array.from(parsedData.getElementsByTagName('item'));
//           const newPosts = posts.filter((post) => {
//             const postGuid = post.getElementsByTagName('guid')[0].textContent;
//             return !oldPostsGuids.includes(postGuid);
//           });
//           if (newPosts.length > 0) {
//             const refreshedPosts = cloneDeep(state.posts);
//             newPosts.forEach((post) => {
//               const postGuid = post.getElementsByTagName('guid')[0].textContent;
//               const postTitle = post.getElementsByTagName('title')[0].textContent;
//               const postLink = post.getElementsByTagName('link')[0].textContent;
//               const postId = uniqueId();
//               Object.assign(refreshedPosts, [
//                 ...refreshedPosts,
//                 { id: postId, feedId: feed.id, postTitle, postLink, postGuid },
//               ]);
//             });
//             Object.assign(state.posts, newPosts);
//           }
//         })
//         .catch((e) => console.log(e))
//         .finally(() => setTimeout(refresh, 5000));
//     }),
//   );
// };

// const refresh = () => {
//   console.log('hiya');
//   const { feeds, posts } = state;
//   const requests = feeds.map((feed) => {
//     axios
//       .get(proxyUrl + feed.feedLink)
//       .then((response) => ({
//         feed,
//         content: response.data,
//       }))
//       .catch((e) => {
//         console.log(e);
//         return null;
//       });
//   });
//   Promise.all(requests)
//     .then((results) => {
//       results.forEach((result) => {
//         // if (!result) {
//         //   return;
//         // }
//         console.log(result);
//       });
//     })
//     .finally(() => {
//       setTimeout(refresh, 5000);
//     });
// };

const state = watchState(initialState)

const update = () => {
  return refresh(state)
    .then((data) => {
      const newPosts = data.flat()
      if (newPosts.length > 0) {
        Object.assign(state.posts, [...state.posts, ...newPosts])
      }
    })
    .catch((e) => {
      console.log(e)
    })
    .finally(() => {
      setTimeout(update, 5000)
    })
}

update()

export default validateUrl
