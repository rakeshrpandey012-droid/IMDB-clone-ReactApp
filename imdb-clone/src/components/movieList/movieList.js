import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
import Card from '../card/Card';
import './movieList.css';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const CATEGORIES = [
  { label: 'Popular', value: 'popular' },
  { label: 'Top Rated', value: 'top_rated' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Now Playing', value: 'now_playing' },
];

const SkeletonCard = () => (
  <div className="card card--skeleton">
    <div className="card__poster-wrap"></div>
    <div className="card__info">
      <div className="card__title"></div>
      <span className="card__year"></span>
    </div>
  </div>
);

const MovieList = ({ movies: propMovies, title: propTitle, showTabs = false }) => {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const searchQuery = searchParams.get('q');
  const isSearchPage = location.pathname === '/search';

  const [movies, setMovies] = useState(propMovies || []);
  const [activeTab, setActiveTab] = useState(type || 'popular');
  const [loading, setLoading] = useState(!propMovies);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovies = useCallback(async (category, pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      let url;
      if (isSearchPage && searchQuery) {
        url = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${pageNum}`;
      } else {
        url = `${BASE_URL}/movie/${category}?api_key=${API_KEY}&language=en-US&page=${pageNum}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch movies');
      const data = await res.json();
      const results = data.results || [];
      setMovies(pageNum === 1 ? results : (prev) => [...prev, ...results]);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isSearchPage, searchQuery]);

  useEffect(() => {
    if (propMovies) return;
    setPage(1);
    fetchMovies(isSearchPage ? null : (type || activeTab), 1);
  }, [type, activeTab, isSearchPage, searchQuery, propMovies, fetchMovies]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setMovies([]);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(isSearchPage ? null : (type || activeTab), nextPage);
  };

  const displayTitle = propTitle
    || (isSearchPage ? `Search results for "${searchQuery}"` : null)
    || CATEGORIES.find(c => c.value === (type || activeTab))?.label
    || 'Movies';

  const displayMovies = propMovies || movies;

  return (
    <section className="movie-list">
      {/* Header: title + optional tabs */}
      <div className="movie-list__header">
        <h2 className="section-title">{displayTitle}</h2>
        {(showTabs || (!propMovies && !isSearchPage)) && (
          <div className="movie-list__tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                className={`movie-list__tab ${activeTab === cat.value ? 'active' : ''}`}
                onClick={() => handleTabChange(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="movie-list__error">
          <p>⚠️ {error}</p>
          <button onClick={() => fetchMovies(type || activeTab, 1)}>Retry</button>
        </div>
      )}

      {/* Empty state for search */}
      {!loading && !error && isSearchPage && displayMovies.length === 0 && (
        <div className="movie-list__empty">
          <p>No results found for <strong>"{searchQuery}"</strong>.</p>
          <p>Try a different search term.</p>
        </div>
      )}

      {/* Grid */}
      <div className="movie-list__grid">
        {displayMovies.map((movie) => (
          <Card key={`${movie.id}-${movie.media_type || 'movie'}`} movie={movie} />
        ))}
        {loading && Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      {/* Load more */}
      {!propMovies && !loading && !error && page < totalPages && (
        <div className="movie-list__load-more">
          <button className="movie-list__load-btn" onClick={handleLoadMore}>
            Load More
          </button>
        </div>
      )}
    </section>
  );
};

export default MovieList;
