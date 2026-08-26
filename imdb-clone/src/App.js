import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Home from './pages/home/home';
import MovieList from './components/movieList/movieList';
import Movie from './pages/movieDetail/movie';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Oops! Page not found.</p>
      <Link to="/">Go Home</Link>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">IMDb</div>
      <div className="footer-links">
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">Data by TMDB</a>
        <a href="https://developer.themoviedb.org/docs" target="_blank" rel="noreferrer">API Docs</a>
        <Link to="/">Home</Link>
        <Link to="/movies/popular">Popular</Link>
        <Link to="/movies/top_rated">Top Rated</Link>
      </div>
      <p>© {new Date().getFullYear()} IMDb Clone. Built with React &amp; TMDB API.</p>
      <p style={{ marginTop: '6px', fontSize: '0.75rem' }}>
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </footer>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<Movie />} />
            <Route path="/movies/:type" element={<MovieList />} />
            <Route path="/search" element={<MovieList />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
