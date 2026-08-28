import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MovieList from '../../components/movieList/movieList';
import './home.css';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroAnimating, setHeroAnimating] = useState(false);

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [trendRes, popularRes, topRes] = await Promise.all([
          fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=en-US`),
          fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`),
          fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`),
        ]);

        const [trendData, popularData, topData] = await Promise.all([
          trendRes.json(),
          popularRes.json(),
          topRes.json(),
        ]);

        setTrending((trendData.results || []).filter(m => m.backdrop_path).slice(0, 8));
        setPopularMovies((popularData.results || []).slice(0, 18));
        setTopRated((topData.results || []).slice(0, 18));
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const changeHero = useCallback((direction) => {
    if (heroAnimating) return;
    setHeroAnimating(true);
    setTimeout(() => {
      setHeroIndex(prev => {
        if (direction === 'next') return (prev + 1) % trending.length;
        return (prev - 1 + trending.length) % trending.length;
      });
      setHeroAnimating(false);
    }, 300);
  }, [heroAnimating, trending.length]);

  // Auto-advance hero
  useEffect(() => {
    if (trending.length === 0) return;
    const timer = setInterval(() => {
      changeHero('next');
    }, 6000);
    return () => clearInterval(timer);
  }, [trending.length, heroIndex, changeHero]);

  const hero = trending[heroIndex];

  return (
    <div className="home">
      {/* ===== HERO BANNER ===== */}
      <section className="hero">
        {loading || !hero ? (
          <div className="hero__skeleton skeleton"></div>
        ) : (
          <>
            <div className={`hero__bg ${heroAnimating ? 'hero__bg--fade' : ''}`}>
              <img
                src={hero.backdrop_path ? `${BACKDROP_BASE}${hero.backdrop_path}` : ''}
                alt={hero.title || hero.name}
                className="hero__bg-img"
              />
              <div className="hero__bg-overlay"></div>
            </div>

            <div className="hero__content">
              <div className="hero__meta">
                {hero.media_type === 'tv' && (
                  <span className="hero__tag hero__tag--tv">TV Series</span>
                )}
                {hero.media_type === 'movie' && (
                  <span className="hero__tag hero__tag--movie">Movie</span>
                )}
                {hero.vote_average > 0 && (
                  <span className="hero__rating">⭐ {hero.vote_average.toFixed(1)}</span>
                )}
              </div>
              <h1 className="hero__title">{hero.title || hero.name}</h1>
              <p className="hero__overview">
                {hero.overview && hero.overview.length > 200
                  ? hero.overview.slice(0, 200) + '...'
                  : hero.overview}
              </p>
              <div className="hero__actions">
                <Link to={`/movie/${hero.id}`} className="hero__btn hero__btn--primary">
                  ▶ More Info
                </Link>
              </div>
            </div>

            {/* Dots navigation */}
            <div className="hero__dots">
              {trending.map((_, i) => (
                <button
                  key={i}
                  className={`hero__dot ${i === heroIndex ? 'active' : ''}`}
                  onClick={() => setHeroIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Arrow buttons */}
            <button className="hero__arrow hero__arrow--left" onClick={() => changeHero('prev')} aria-label="Previous">
              &#10094;
            </button>
            <button className="hero__arrow hero__arrow--right" onClick={() => changeHero('next')} aria-label="Next">
              &#10095;
            </button>

            {/* Thumbnail strip */}
            <div className="hero__thumbnails">
              {trending.slice(0, 6).map((m, i) => (
                <button
                  key={m.id}
                  className={`hero__thumb ${i === heroIndex ? 'active' : ''}`}
                  onClick={() => setHeroIndex(i)}
                >
                  {m.poster_path && (
                    <img src={`${POSTER_BASE}${m.poster_path}`} alt={m.title || m.name} loading="lazy" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ===== WHAT TO WATCH (Popular) ===== */}
      <MovieList
        movies={popularMovies}
        title="Popular Movies"
      />

      {/* ===== TOP RATED ===== */}
      <MovieList
        movies={topRated}
        title="Top Rated Movies"
      />

      {/* ===== CTA Banner ===== */}
      <section className="home__cta">
        <div className="home__cta-inner">
          <h2>Explore All Categories</h2>
          <p>Discover thousands of movies and TV shows. Browse by category or search for your favorites.</p>
          <div className="home__cta-links">
            <Link to="/movies/popular" className="home__cta-btn">Popular</Link>
            <Link to="/movies/top_rated" className="home__cta-btn">Top Rated</Link>
            <Link to="/movies/upcoming" className="home__cta-btn">Upcoming</Link>
            <Link to="/movies/now_playing" className="home__cta-btn home__cta-btn--outlined">Now Playing</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
