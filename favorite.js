const BASE_URL = 'https://movie-list.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/v1/movies/'
const POSTER_URL = BASE_URL + 'posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')

renderMovieList(movies)

dataPanel.addEventListener('click', function onPanelClick(event) {
  const target = event.target

  if (target.matches('.btn-show-movie')) {
    showMovieModal(target.dataset.id)
  } else if (target.matches('.btn-remove-favorite')){
    removeFavorite(target.dataset.id)
  }
})

function renderMovieList(data) {
  let rawHTML = ''
  for (let item of data) {
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL+item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#movie-modal">
                More
              </button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>  
            </div>
          </div>
        </div>
      </div>     
    `
  }
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const movieTitle = document.querySelector('#movie-modal-title')
  const movieImage = document.querySelector('#movie-modal-image')
  const movieDate = document.querySelector('#movie-modal-date')
  const movieDescription = document.querySelector('#movie-modal-description')

  const data = movies.find(function(movie){
    return movie.id === Number(id)
  })
   
  movieTitle.textContent = data.title
  movieImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  movieDate.textContent = "Release Date:" + data.release_date
  movieDescription.textContent = data.description
}  

function removeFavorite(id) {
//   if (!movies || !movies.length) return
//   let list = movies
//   console.log('listA: ',list)
//   console.log('moviesA: ',movies)
//   list = list.filter(function(movie){
//     return movie.id !== Number(id)
//   })
//   console.log('listB: ', list)
//   localStorage.setItem('favoriteMovies', JSON.stringify(list))
  
//   renderMovieList(list) 
// }


  if (!movies || !movies.length) return

  //透過 id 找到要刪除電影的 index
  const movieIndex = movies.findIndex((movie) => movie.id === Number(id) )
  if (movieIndex === -1) return

  //刪除該筆電影
  movies.splice(movieIndex, 1)

  //存回 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  //更新頁面
  renderMovieList(movies)
}