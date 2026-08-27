import React from 'react';
import { Link } from 'react-router-dom';
import './Card.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='342' height='513' viewBox='0 0 342 513'%3E%3Crect width='342' height='513' fill='%231e1e1e'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E";

const RatingBadge = ({ rating }) => {
  const score = Math.round(rating * 10) / 10;
  const className =
    score >= 7 ? 'rating--good' : score >= 5 ? 'rating--mid' : 'rating--bad';
  return (
    <span className={`card__rating ${className}`}>
      ⭐ {score.toFixed(1)}
    </span>
  );
};

const Card = ({ movie }) => {
  if (!movie) return null;

  const {
    id,
    title,
    name,
    poster_path,
    vote_average,
    release_date,
    first_air_date,
    overview,
    media_type,
  } = movie;

  const displayTitle = title || name || 'Unknown';
  const year = (release_date || first_air_date || '').slice(0, 4);
  const posterSrc = poster_path ? `${POSTER_BASE}${poster_path}` : FALLBACK;
  const linkPath = `/movie/${id}`;

  return (
    <Link to={linkPath} className="card" aria-label={displayTitle}>
      <div className="card__poster-wrap">
        <img
          className="card__poster"
          src={posterSrc}
          alt={displayTitle}
          loading="lazy"
          onError={(e) => { e.target.src = FALLBACK; }}
        />
        {/* Hover overlay */}
        <div className="card__overlay">
          <p className="card__overview">
            {overview
              ? overview.length > 140
                ? overview.slice(0, 140) + '...'
                : overview
              : 'No description available.'}
          </p>
          <span className="card__view-btn">View Details →</span>
        </div>
        {/* Rating badge */}
        {vote_average > 0 && <RatingBadge rating={vote_average} />}
        {/* Media type tag */}
        {media_type === 'tv' && <span className="card__type-tag">TV</span>}
      </div>
      <div className="card__info">
        <h3 className="card__title">{displayTitle}</h3>
        {year && <span className="card__year">{year}</span>}
      </div>
    </Link>
  );
};

export default Card;
