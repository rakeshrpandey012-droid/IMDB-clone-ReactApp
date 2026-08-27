import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/card/Card';
import './movie.css';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const PROFILE_BASE = 'https://image.tmdb.org/t/p/w185';
const FALLBACK_POSTER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='750' viewBox='0 0 500 750'%3E%3Crect width='500' height='750' fill='%231e1e1e'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E";
const FALLBACK_PROFILE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='185' height='278' viewBox='0 0 185 278'%3E%3Crect width='185' height='278' fill='%231e1e1e'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' fill='%23666'%3E%3F%3C/text%3E%3C/svg%3E";

// Star rating component
const StarRating = ({ rating }) => {
  const stars = Math.round(rating / 2); // out of 5
  return (
    <div className="movie__stars" aria-label={`Rating: ${rating}/10`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`star ${i < stars ? 'star--filled' : 'star--empty'}`}>★</span>
      ))}
      <span className="movie__rating-text">{rating.toFixed(1)} / 10</span>
    </div>
  );
};

// Format runtime
const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// Format currency
const formatMoney = (amount) => {
  if (!amount || amount === 0) return 'N/A';
  return '$' + new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(amount);
};

const Movie = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      setError(null);
      setImgLoaded(false);
      window.scrollTo(0, 0);

      try {
        const [movieRes, creditsRes, videosRes, similarRes] = await Promise.all([
          fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`),
          fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}&language=en-US`),
          fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`),
          fetch(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}&language=en-US&page=1`),
        ]);

        if (!movieRes.ok) throw new Error('Movie not found');

        const [movieData, creditsData, videosData, similarData] = await Promise.all([
          movieRes.json(),
          creditsRes.json(),
          videosRes.json(),
          similarRes.json(),
        ]);

        setMovie(movieData);
        setCast((creditsData.cast || []).slice(0, 12));

        // Find trailer or teaser
        const videos = videosData.results || [];
        const yt = videos.find(
          v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        setTrailer(yt || null);

        setSimilar((similarData.results || []).slice(0, 12));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  // ---- LOADING ----
  if (loading) {
    return (
      <div className="movie-detail">
        <div className="movie-detail__skeleton">
          <div className="mds__backdrop skeleton"></div>
          <div className="mds__content">
            <div className="mds__poster skeleton"></div>
            <div className="mds__info">
              <div className="mds__title skeleton"></div>
              <div className="mds__meta skeleton"></div>
              <div className="mds__overview skeleton"></div>
              <div className="mds__overview skeleton" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- ERROR ----
  if (error || !movie) {
    return (
      <div className="movie-detail__error">
        <h2>😕 {error || 'Movie not found'}</h2>
        <p>We couldn't load this movie. Please try again.</p>
        <button onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  const {
    title, overview, poster_path, backdrop_path,
    vote_average, vote_count, release_date, runtime,
    genres = [],
    budget, revenue, status, original_language, tagline,
  } = movie;

  const year = release_date ? release_date.slice(0, 4) : '';
  const posterSrc = poster_path ? `${POSTER_BASE}${poster_path}` : FALLBACK_POSTER;
  const backdropSrc = backdrop_path ? `${BACKDROP_BASE}${backdrop_path}` : null;



  return (
    <div className="movie-detail">
      {/* ===== BACKDROP ===== */}
      {backdropSrc && (
        <div className="movie-detail__backdrop">
          <img src={backdropSrc} alt={title} />
          <div className="movie-detail__backdrop-overlay"></div>
        </div>
      )}

      {/* ===== MAIN INFO ===== */}
      <div className="movie-detail__main">
        <div className="movie-detail__inner">
          {/* Poster */}
          <div className="movie-detail__poster-wrap">
            <img
              className={`movie-detail__poster ${imgLoaded ? 'loaded' : ''}`}
              src={posterSrc}
              alt={title}
              onLoad={() => setImgLoaded(true)}
              onError={(e) => { e.target.src = FALLBACK_POSTER; setImgLoaded(true); }}
            />
            {/* Trailer button */}
            {trailer && (
              <button className="movie-detail__trailer-btn" onClick={() => setShowTrailer(true)}>
                ▶ Watch Trailer
              </button>
            )}
          </div>

          {/* Info */}
          <div className="movie-detail__info">
            {/* Title */}
            <h1 className="movie-detail__title">
              {title}
              {year && <span className="movie-detail__year"> ({year})</span>}
            </h1>

            {/* Tagline */}
            {tagline && <p className="movie-detail__tagline">"{tagline}"</p>}

            {/* Rating */}
            {vote_average > 0 && (
              <div className="movie-detail__rating-wrap">
                <StarRating rating={vote_average} />
                <span className="movie-detail__vote-count">({vote_count?.toLocaleString()} votes)</span>
              </div>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div className="movie-detail__genres">
                {genres.map((g) => (
                  <span key={g.id} className="movie-detail__genre">{g.name}</span>
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="movie-detail__section">
              <h3>Overview</h3>
              <p className="movie-detail__overview">
                {overview || 'No overview available.'}
              </p>
            </div>

            {/* Details grid */}
            <div className="movie-detail__details">
              <div className="movie-detail__detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">{status || 'N/A'}</span>
              </div>
              <div className="movie-detail__detail-item">
                <span className="detail-label">Runtime</span>
                <span className="detail-value">{formatRuntime(runtime)}</span>
              </div>
              <div className="movie-detail__detail-item">
                <span className="detail-label">Release Date</span>
                <span className="detail-value">
                  {release_date
                    ? new Date(release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'N/A'}
                </span>
              </div>
              <div className="movie-detail__detail-item">
                <span className="detail-label">Language</span>
                <span className="detail-value">{original_language?.toUpperCase() || 'N/A'}</span>
              </div>
              <div className="movie-detail__detail-item">
                <span className="detail-label">Budget</span>
                <span className="detail-value">{formatMoney(budget)}</span>
              </div>
              <div className="movie-detail__detail-item">
                <span className="detail-label">Revenue</span>
                <span className="detail-value">{formatMoney(revenue)}</span>
              </div>
            </div>

            {/* Back button */}
            <button className="movie-detail__back-btn" onClick={() => navigate(-1)}>
              ← Go Back
            </button>
          </div>
        </div>
      </div>

      {/* ===== CAST ===== */}
      {cast.length > 0 && (
        <section className="movie-detail__section movie-detail__cast-section">
          <div className="movie-detail__section-inner">
            <h2 className="section-title">Top Cast</h2>
            <div className="cast-grid">
              {cast.map((person) => (
                <div key={person.id} className="cast-card">
                  <div className="cast-card__img-wrap">
                    <img
                      src={person.profile_path ? `${PROFILE_BASE}${person.profile_path}` : FALLBACK_PROFILE}
                      alt={person.name}
                      loading="lazy"
                      onError={(e) => { e.target.src = FALLBACK_PROFILE; }}
                    />
                  </div>
                  <div className="cast-card__info">
                    <p className="cast-card__name">{person.name}</p>
                    <p className="cast-card__character">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== SIMILAR MOVIES ===== */}
      {similar.length > 0 && (
        <section className="movie-detail__section movie-detail__similar-section">
          <div className="movie-detail__section-inner">
            <h2 className="section-title">Similar Movies</h2>
            <div className="similar-grid">
              {similar.map((m) => (
                <Card key={m.id} movie={m} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== TRAILER MODAL ===== */}
      {showTrailer && trailer && (
        <div className="trailer-modal" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal__inner" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-modal__close" onClick={() => setShowTrailer(false)}>✕</button>
            <div className="trailer-modal__embed">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                title={`${title} Trailer`}
                frameBorder="0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movie;
