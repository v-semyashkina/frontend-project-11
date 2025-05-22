export default (data) => {
  const parser = new DOMParser()
  const parsedData = parser.parseFromString(data, 'text/xml')
  return parsedData
}
