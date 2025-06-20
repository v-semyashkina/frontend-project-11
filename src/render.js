const renderFeeds = (feeds, feedsHeader) => {
  const feedsContainer = document.querySelector('.feeds')
  feedsContainer.textContent = ''
  const card = document.createElement('div')
  card.classList.add('card', 'border-0')
  const cardBody = document.createElement('div')
  cardBody.classList.add('card-body')
  const header = document.createElement('h2')
  header.classList.add('card-title', 'h4')
  header.textContent = feedsHeader
  const list = document.createElement('ul')
  list.classList.add('list-group', 'border-0', 'rounded-0')
  cardBody.append(header)
  card.append(cardBody)
  feeds.forEach((feed) => {
    const listItem = document.createElement('li')
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0')
    const title = document.createElement('h3')
    title.classList.add('h6', 'm-0')
    title.textContent = feed.feedTitle
    const description = document.createElement('p')
    description.classList.add('m-0', 'small', 'text-black-50')
    description.textContent = feed.feedDescription
    listItem.append(title)
    listItem.append(description)
    list.prepend(listItem)
  })
  feedsContainer.append(card)
  feedsContainer.append(list)
}

const renderPosts = (state, postsHeader, buttonText, updateModal, addPostToSeen) => {
  const { posts, seenPosts } = state
  const postContainer = document.querySelector('.posts')
  postContainer.textContent = ''
  const card = document.createElement('div')
  card.classList.add('card', 'border-0')
  const cardBody = document.createElement('div')
  cardBody.classList.add('card-body')
  const header = document.createElement('h2')
  header.classList.add('card-title', 'h4')
  header.textContent = postsHeader
  const list = document.createElement('ul')
  list.classList.add('list-group', 'border-0', 'rounded-0')
  cardBody.append(header)
  card.append(cardBody)
  posts.forEach((post) => {
    const listItem = document.createElement('li')
    listItem.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    )
    const link = document.createElement('a')
    seenPosts.has(post.id)
      ? link.classList.add('fw-normal', 'link-secondary')
      : link.classList.add('fw-bold')
    link.href = post.postLink
    link.textContent = post.postTitle
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.dataset.id = post.id
    listItem.append(link)
    const button = document.createElement('button')
    button.type = 'button'
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm')
    button.dataset.id = post.id
    button.dataset.bsToggle = 'modal'
    button.dataset.bsTarget = '#modal'
    button.textContent = buttonText
    button.addEventListener('click', () => {
      updateModal(post)
      addPostToSeen(post.id)
    })
    listItem.append(button)
    list.append(listItem)
  })
  postContainer.append(card)
  postContainer.append(list)
}

export { renderFeeds, renderPosts }
