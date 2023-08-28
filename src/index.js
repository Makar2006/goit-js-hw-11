import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './js/image-api';

const searchFormEl = document.querySelector('.search-form');
const loadMoreEl = document.querySelector('.js-load-more');
const galleryEl = document.querySelector('.gallery');

let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

searchFormEl.addEventListener('submit', whenSubmit);
loadMoreEl.addEventListener('click', loadMoreClick);

async function whenSubmit(e) {
  e.preventDefault();
  page = 1;
  query = e.currentTarget.elements.searchQuery.value.trim();
  galleryEl.innerHTML = '';

  if (query === '') {
    Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
    );
    return;
  }
  fetchImages(query, page, perPage)
    .then(response => {
      if (response.hits.length < perPage) {
        loadMoreEl.classList.replace('load-more', 'load-more-hidden');
        loadMoreEl.disabled = true;
      } else {
        loadMoreEl.classList.replace('load-more-hidden', 'load-more');
        loadMoreEl.disabled = false;
      }
      if (response.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        galleryEl.insertAdjacentHTML('beforeend', createMarkup(response.hits));
        simpleLightBox = new SimpleLightbox('.gallery a', {
          captions: true,
          captionsData: 'alt',
          captionPosition: 'bottom',
          captionDelay: 250,
        }).refresh();
        Notiflix.Notify.success(
          `Hooray! We found ${response.totalHits} images.`
        );
      }
    })
    .catch(onFetchError)
    .finally(() => {
      searchFormEl.reset();
    });
}

function loadMoreClick() {
  page += 1;
  simpleLightBox.destroy();
  loadMoreEl.disabled = true;

  fetchImages(query, page, perPage)
    .then(response => {
      galleryEl.insertAdjacentHTML('beforeend', createMarkup(response.hits));
      simpleLightBox = new SimpleLightbox('.gallery a', {
        captions: true,
        captionsData: 'alt',
        captionPosition: 'bottom',
        captionDelay: 250,
      }).refresh();
      const totalPages = Math.ceil(response.totalHits / perPage);
      if (page < totalPages) {
        loadMoreEl.classList.replace('load-more-hidden', 'load-more');
        loadMoreEl.disabled = false;
      } else {
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        loadMoreEl.classList.replace('load-more', 'load-more-hidden');
      }
    })
    .catch(onFetchError);
}
function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        id,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a class="gallery__link" href="${largeImageURL}">
            <div class="gallery-item" id="${id}">
              <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
              <div class="info">
                <p class="info-item"><b>Likes</b>${likes}</p>
                <p class="info-item"><b>Views</b>${views}</p>
                <p class="info-item"><b>Comments</b>${comments}</p>
                <p class="info-item"><b>Downloads</b>${downloads}</p>
              </div>
            </div>
          </a>`;
      }
    )
    .join('');
}
function onFetchError(error) {
  console.log(error);

  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.',
    {
      position: 'center-center',
      timeout: 5000,
      width: '400px',
      fontSize: '24px',
    }
  );
}
