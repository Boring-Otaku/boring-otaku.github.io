// anime-trailer.js
// Fetch a random anime trailer using Jikan API (for MyAnimeList) or alternative.
// We use Jikan to get list of anime, pick random, then fetch trailer embed URL.

async function loadRandomTrailer() {
  const container = document.getElementById('trailer-container');
  const apiPage = 1 + Math.floor(Math.random() * 5); // choose random page 1-5 of popular list
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?status=Released&order_by=score&sort=desc&page=${apiPage}&limit=25`);
    const data = await res.json();
    const anime = data.data[Math.floor(Math.random() * data.data.length)];
    // Get trailer details
    const trailer = anime.trailer;
    if (trailer && trailer.embed_url) {
      container.innerHTML = `<iframe width="100%" height="500px" src="${trailer.embed_url}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      container.innerHTML = `<p>No trailer available for ${anime.title}.</p>`;
    }
  } catch (e) {
    container.innerHTML = `<p>Error loading trailer.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadRandomTrailer);
