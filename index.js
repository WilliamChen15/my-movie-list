const BASE_URL = 'https://movie-list.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/v1/movies/'
const POSTER_URL = BASE_URL + 'posters/'
const movies = []
const MOVIES_PER_PAGE = 12  
let filteredMovies = []
let viewModeController = 0 //預設page-mode
let currentPage = 1 //當前頁碼
const isFavoriteMovies = Array(80).fill(0) //由於每次重整頁面，都會重新向API請求資料，若將資料併入其中，會造成favorite-icon的錯誤，因此將這筆資料與API回傳資料分開存放。
// console.log(isFavoriteMovies)

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#navigator')
const viewModeIcon = document.querySelector('#view-mode-icon') //監聽設置處

// 改動icon大小
const pageIcon = document.querySelector('#show-page-view') 
const listIcon = document.querySelector('#show-list-view')



axios.get(INDEX_URL).then((response) => {
  const raw = []
  raw.push(... response.data.results)
 
  checkFavorite(raw) // 拿到正確的isFavoriteMovies，重新放進movies
  // console.log(isFavoriteMovies)

  for (let i = 0;i< raw.length;i++){
    const temporary = raw[i]
    temporary.favorite = isFavoriteMovies[i]
    movies.push(temporary)
  }
  console.log(movies) // 有正確favorite屬性的movies陣列

  renderMovieListInPage(getMoviesByPage(currentPage))
  renderPaginator(movies.length) 
}).catch((err) => console.log(err))



searchForm.addEventListener('submit', onSearchFormSubmitted)

dataPanel.addEventListener('click',function onPanelClick(event){
  const target = event.target
  if (target.matches('.btn-show-movie')){
    showMovieModal(target.dataset.id)
  } else if (target.matches('.btn-add-favorite')) {
    if (target.matches('.btn-danger')){ 
      return  // 若以加入最愛則直接停止，不執行函式
    }
    addToFavorite(Number(target.dataset.id))
  }
})

viewModeIcon.addEventListener('click',viewModeChange) 

paginator.addEventListener('click', function onPaginatorClicked(event) {
  paginator.children[currentPage - 1].classList.remove('active') //消除原先頁碼高光
  if (event.target.tagName !== 'A') return
  currentPage = Number(event.target.dataset.page)
  if(viewModeController === 0){
    renderMovieListInPage(getMoviesByPage(currentPage))
  } else {
    renderMovieListInList(getMoviesByPage(currentPage))
  }
  paginator.children[currentPage - 1].classList.add('active') //高光當前頁碼
})

function renderMovieListInPage(data){
  viewModeController = 0 //page-mode
  // icon大小變化
  if (!pageIcon.classList.contains('fa-lg')){
    pageIcon.classList.remove('fa-sm')
    pageIcon.classList.add('fa-lg')
    listIcon.classList.remove('fa-lg')
    listIcon.classList.add('fa-sm')
  } 
  let rawHTML=''
  for (let item of data){
      rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#movie-modal">
                More
              </button>
              ${ item.favorite === 1 ? `<button class="btn btn-danger btn-add-favorite" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#remind-modal"> 
                + 
              </button>` : `<button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>`}   
            </div>
          </div>
        </div>
      </div>     
    `   
  }
  dataPanel.innerHTML = rawHTML
}

function renderMovieListInList(data){
  viewModeController = 1 //list-mode
  // icon大小變化
  if (!listIcon.classList.contains('fa-lg')) {
    listIcon.classList.remove('fa-sm')
    listIcon.classList.add('fa-lg')
    pageIcon.classList.remove('fa-lg')
    pageIcon.classList.add('fa-sm')
  } 
  let rawHTML = '<ul class="movie-list list-unstyled">'
  for (let item of data) {
      rawHTML += `
        <div class="border-bottom border-secondary mb-2">
          <div class="list-name row row-cols-auto justify-content-between align-items-center mb-3">            
            <li class="movie-name align-items-center pt-3">
              <h5 class="list-title ">${item.title}</h5>
            </li>
            <div class="list-button pt-2">
              <button class="btn btn-primary btn-show-movie" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#movie-modal">
                More
              </button>
              ${ item.favorite===1 ? `<button class="btn btn-danger btn-add-favorite" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#remind-modal">
                +
              </button>` : `<button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>`}
            </div>
          </div>
        </div>
    `
  }
  rawHTML += '</ul>'
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id){
  const movieTitle = document.querySelector('#movie-modal-title')
  const movieImage = document.querySelector('#movie-modal-image')
  const movieDate = document.querySelector('#movie-modal-date')
  const movieDescription = document.querySelector('#movie-modal-description')

  movieTitle.textContent = " "
  movieImage.textContent = " "
  movieDate.textContent = " " 
  movieDescription.textContent = " "

  axios.get(INDEX_URL + id).then(response=>{ //為什麼這裡不用存好的movies?
    const data = response.data.results
    movieTitle.textContent = data.title
    movieImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    movieDate.textContent = " Release Date: " + data.release_date
    movieDescription.textContent = data.description
  })
}  

function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  currentPage = 1
  renderPaginator(filteredMovies.length) 
  if (viewModeController === 0) {  
    renderMovieListInPage(getMoviesByPage(currentPage)) 
  } else {
    renderMovieListInList(getMoviesByPage(currentPage))
  }  
}

function addToFavorite(id){
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id) // 先以id抓出單筆資料
  const movieIndex = movies.findIndex(movie => movie.id === id) // 找該筆資料於全表中的索引位置
  movies[movieIndex].favorite = 1 
  // console.log('執行') //測試是否有執行函式
  if (viewModeController === 0) {
    renderMovieListInPage(getMoviesByPage(currentPage))
  } else {
    renderMovieListInList(getMoviesByPage(currentPage))
  }   
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
  paginator.children[currentPage - 1].classList.add('active') 
}

function viewModeChange(event){
  const target = event.target
  if (target.matches('#show-page-view')){
    renderMovieListInPage(getMoviesByPage(currentPage))
  } else if (target.matches('#show-list-view')){
    renderMovieListInList(getMoviesByPage(currentPage))
  }
}

// 重整頁面後的初次渲染，從localStorage抓資料來用
function checkFavorite(data){
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  for (const item of list){
    const favoriteMovieIndex = data.findIndex(movie => movie.id === item.id)
    isFavoriteMovies.fill(1,favoriteMovieIndex,favoriteMovieIndex+1)
  }
}

