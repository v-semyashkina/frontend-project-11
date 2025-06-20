// eslint-disable-next-line no-unused-vars
import { Modal } from 'bootstrap';
import { object, string } from 'yup';
import axios from 'axios';
import { uniqueId } from 'lodash';
import i18n from 'i18next';
import ru from './locales/ru.js';
import watchState from './view.js';
import parse from './parse.js';
import refresh from './refresh.js';

export default () => {
  i18n
    .init({
      lng: 'ru',
      debug: true,
      resources: {
        ru,
      },
    })
    .then(() => {
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
        modal: {
          title: '',
          description: '',
          link: '',
        },
        seenPosts: new Set([]),
      };

      const getLink = (link) => `https://allorigins.hexlet.app/get?disableCache=true&url=${link}`;

      const schema = object().shape({
        newUrl: string('urlInvalid')
          .required('urlInvalid')
          .url('urlInvalid')
          .test('not-in-feeds', 'rssExists', function (value) {
            const { existingFeeds } = this.parent;
            return !existingFeeds.includes(value);
          }),
      });

      const form = document.querySelector('.rss-form');
      const input = document.querySelector('#url-input');

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newUrl = input.value.trim();
        const existingFeeds = state.feeds.map((feed) => feed.feedLink);
        const dataToValidate = { newUrl, existingFeeds };
        schema
          .validate(dataToValidate, { abortEarly: false })
          .then(() => {
            state.form = { ...state.form, error: 'noError', isValid: true };
          })
          .then(() => {
            state.loadingProcess = { ...state.loadingProcess, state: 'loading' };
            const proxyLink = getLink(newUrl);
            return axios.get(proxyLink);
          })
          .then((response) => {
            const responseStatus = response.status;
            if (responseStatus !== 200) {
              state.loadingProcess = {
                ...state.loadingProcess,
                state: 'failed',
                error: 'rssInvalid',
              };
            } else {
              const data = response.data.contents;
              const parsedData = parse(data);
              const parseError = parsedData.getElementsByTagName('parsererror');
              if (parseError.length > 0) {
                state.loadingProcess = {
                  ...state.loadingProcess,
                  state: 'failed',
                  error: 'rssInvalid',
                };
              } else {
                const feedTitle = parsedData.getElementsByTagName('title')[0].textContent;
                const feedDescription =
                  parsedData.getElementsByTagName('description')[0].textContent;
                const feedLink = newUrl;
                const id = uniqueId();
                state.feeds = [...state.feeds, { id, feedTitle, feedDescription, feedLink }];
                const posts = Array.from(parsedData.getElementsByTagName('item'));
                const newPosts = posts.map((post) => {
                  const postGuid = post.getElementsByTagName('guid')[0].textContent;
                  const postTitle = post.getElementsByTagName('title')[0].textContent;
                  const postDescription = post.getElementsByTagName('description')[0].textContent;
                  const postLink = post.getElementsByTagName('link')[0].textContent;
                  const postId = uniqueId();
                  return { id: postId, feedId: id, postTitle, postDescription, postLink, postGuid };
                });
                state.posts = [...newPosts, ...state.posts];
                state.loadingProcess = {
                  ...state.loadingProcess,
                  state: 'success',
                  error: 'noError',
                };
              }
            }
          })
          .then(() => {
            const feeds = state.feeds.map((feed) => {
              const id = feed.id;
              const link = feed.feedLink;
              return { id, link };
            });
            refresh(feeds);
          })
          .catch((e) => {
            if (e.name === 'AxiosError') {
              state.loadingProcess = {
                ...state.loadingProcess,
                state: 'failed',
                error: 'networkError',
              };
            } else {
              console.log(e);
              const message = e.errors[0];
              state.form = { ...state.form, error: message, isValid: false };
            }
          });
      });

      const updateModal = (post) => {
        console.log('modal updated');
        state.modal = {
          ...state.modal,
          title: post.postTitle,
          description: post.postDescription,
          link: post.postLink,
        };
      };

      const addPostToSeen = (id) => {
        state.seenPosts.add(id);
      };

      const state = watchState(initialState, i18n, updateModal, addPostToSeen);

      const update = () => {
        return refresh(state, getLink)
          .then((newPosts) => {
            if (newPosts.length > 0) {
              state.posts = [...newPosts, ...state.posts];
            }
          })
          .catch((e) => {
            console.log(e);
          })
          .finally(() => {
            setTimeout(update, 5000);
          });
      };

      update();
    })
    .catch((e) => {
      console.log(e);
    });
};
