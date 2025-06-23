import axios from 'axios'
import parse from './parse.js'

export default (state, getLink, processPosts) => {
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
            const processedPosts = processPosts(newPosts, feed.id)
            return processedPosts
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
