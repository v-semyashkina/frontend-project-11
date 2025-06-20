import axios from 'axios'
import parse from './parse.js'
import { uniqueId } from 'lodash'

export default (state, getLink) => {
  const { feeds, posts } = state
  return Promise.all(
    (feeds || []).map((feed) => {
      const proxyLink = getLink(feed.feedLink)
      const oldPostsGuids = posts
        .filter(post => post.feedId === feed.id)
        .map(post => post.postGuid)
      return axios
        .get(proxyLink)
        .then((response) => {
          const data = response.data.contents
          const parsedData = parse(data)
          const posts = Array.from(parsedData.getElementsByTagName('item'))
          const newPosts = posts.filter((post) => {
            const postGuid = post.getElementsByTagName('guid')[0].textContent
            return !oldPostsGuids.includes(postGuid)
          })
          if (newPosts.length > 0) {
            return newPosts.map((post) => {
              const postGuid = post.getElementsByTagName('guid')[0].textContent
              const postTitle = post.getElementsByTagName('title')[0].textContent
              const postDescription = post.getElementsByTagName('description')[0].textContent
              const postLink = post.getElementsByTagName('link')[0].textContent
              const postId = uniqueId()
              return {
                id: postId,
                feedId: feed.id,
                postTitle,
                postDescription,
                postLink,
                postGuid,
              }
            })
          }
          return []
        })
        .catch((e) => {
          console.log(e)
          return []
        })
    }),
  ).then((results) => {
    return results.flat()
  })
}
