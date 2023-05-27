import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '36809568-a0d5a67efa5c37ce2fdc5564f';
const BASE_URL = 'https://pixabay.com/api/';
const ITEMS_PER_PAGE = 40;

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
let currentPage = 1;
let currentQuery = '';

const lightbox = new SimpleLightbox('.gallery a');

searchForm.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', loadMoreImages);

async function handleFormSubmit(event) {
  event.preventDefault();
  currentPage = 1;
  gallery.innerHTML = '';
  currentQuery = searchForm.elements.searchQuery.value.trim();
  if (currentQuery === '') {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  }
  try {
    const images = await searchImages(currentQuery, currentPage);
    displayImages(images);
  } catch (error) {
    console.error('Error searching images:', error);
    Notiflix.Notify.failure('Failed to search images. Please try again later.');
  }
}

async function searchImages(query, page) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: ITEMS_PER_PAGE,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
}

function displayImages(images) {
  if (images.hits.length === 0) {
    Notiflix.Notify.warning(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  const totalHits = images.totalHits;
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  const imageCards = images.hits.map(image => createImageCard(image));
  gallery.innerHTML += imageCards.join('');
  lightbox.refresh();
  if (totalHits > currentPage * ITEMS_PER_PAGE) {
    loadMoreBtn.style.display = 'block';
  } else {
    loadMoreBtn.style.display = 'none';
    if (currentPage > 1) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  }
  currentPage++;
}

function createImageCard(image) {
  return `
    <div class="photo-card">
      <a href="${image.largeImageURL}" data-lightbox="image">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </div>
  `;
}

async function loadMoreImages() {
  try {
    const images = await searchImages(currentQuery, currentPage);
    displayImages(images);
    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
  } catch (error) {
    console.error('Error loading more images:', error);
    Notiflix.Notify.failure(
      'Failed to load more images. Please try again later.'
    );
  }
}
