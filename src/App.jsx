import { useEffect, useState } from 'react';
import './App.css';
import memesData from './data/memes.json';

function App() {
  const [memeImage, setMemeImage] = useState('');
  const [headline, setHeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextPage, setNextPage] = useState(null);

  const API_BASE_URL = 'https://newsdata.io/api/1/latest';
  const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
  const API_PARAMS = `apikey=${API_KEY}&country=in&language=en`;

  function formatForMeme(text) {
    return text
      .replace(/'/g, "''")
      .replace(/-/g, '--')
      .replace(/_/g, '__')
      .replace(/\?/g, '~q')
      .replace(/&/g, '~a')
      .replace(/%/g, '~p')
      .replace(/#/g, '~h')
      .replace(/\//g, '~s')
      .replace(/\\/g, '~b')
      .replace(/</g, '~l')
      .replace(/>/g, '~g')
      .replace(/:/g, '')
      .replace(/\s+/g, '_');
  }

  function getRandomMemeId() {
    return memesData[Math.floor(Math.random() * memesData.length)].id;
    }

    function preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = resolve;
      img.onerror = reject;
    });
  }
  async function fetchArticles(pageToken = null) {
    setLoading(true);
    setMemeImage('');
    setHeadline('');
    try {
      const url = `${API_BASE_URL}?${API_PARAMS}${pageToken ? `&page=${pageToken}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'success' && data.results?.length > 0) {
        setArticles(data.results);
        setCurrentIndex(0);
        setNextPage(data.nextPage || null);

        const formattedTitle = formatForMeme(data.results[0].title || 'No headline');
        setHeadline(formattedTitle);
        setMemeImage(getRandomMemeId());
      } else {
        setHeadline('No_headline_found');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setHeadline('Failed_to_load_headline');
    } finally {
      setLoading(false);
    }
  }

  async function generateMeme() {
  setLoading(true);
  setMemeImage('');
  setHeadline('');

  let newHeadline = '';
  let memeId = getRandomMemeId();

  if (currentIndex + 1 < articles.length) {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    newHeadline = formatForMeme(articles[nextIndex].title || 'No headline');
  } else if (nextPage) {
    await fetchArticles(nextPage);
    return; // return here, fetchArticles will trigger image + headline update
  } else {
    await fetchArticles();
    return;
  }

  const memeUrl = `https://api.memegen.link/images/${memeId}/${encodeURIComponent(newHeadline)}.jpg?layout=top`;

  try {
    await preloadImage(memeUrl);
    setHeadline(newHeadline);
    setMemeImage(memeId);
  } catch (err) {
    console.error('Image failed to load', err);
    setHeadline('Image_failed_to_load');
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    fetchArticles();
  }, []);

  return (
   <div className="App">
      <h1 className="meme-title">🗞️ Times of Absurdia</h1>
      <p className="meme-subtitle">A random meme image paired with a real news headline — because why not?</p>

      <div className="meme-container">
        {loading ? (
          <div className="spinner" />
        ) : (
          memeImage && headline && (
            <img
              src={`https://api.memegen.link/images/${memeImage}/${encodeURIComponent(headline)}.jpg?layout=top`}
              className="meme-img"
              alt="News Meme"
              onLoad={() => setLoading(false)}
            />
          )
        )}
      </div>

      {!loading && (
        <button onClick={generateMeme} className="meme-button" style={{ marginTop: '20px' }}>
          New Meme
        </button>
      )}
    </div>

  );
}

export default App;
