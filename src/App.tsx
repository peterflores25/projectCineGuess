import React, { useState, useCallback, useEffect } from 'react';
import { Film, Popcorn, Award, Users, BookOpen, Calendar, RefreshCcw, Camera, Library } from 'lucide-react';
import { TMDBMovie, getPopularMovies } from './tmdb';

type Hint = {
  name: string;
  value: string | number;
  icon: React.ReactNode;
};

function App() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [movieToGuess, setMovieToGuess] = useState<TMDBMovie | null>(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [message, setMessage] = useState('');
  const [shake, setShake] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      const fetchedMovies = await getPopularMovies();
      setMovies(fetchedMovies);
      setMovieToGuess(fetchedMovies[Math.floor(Math.random() * fetchedMovies.length)]);
      setLoading(false);
    };

    fetchMovies();
  }, []);

  const hints: Hint[] = movieToGuess ? [
    { name: 'Réalisateur', value: movieToGuess.director || 'Non disponible', icon: <Award className="w-5 h-5" /> },
    { name: 'Année de sortie', value: movieToGuess.release_date, icon: <Calendar className="w-5 h-5" /> },
    { name: 'Genre', value: movieToGuess.genre, icon: <Film className="w-5 h-5" /> },
    { name: 'Casting', value: movieToGuess.cast.join(', '), icon: <Users className="w-5 h-5" /> },
    { name: 'Synopsis', value: movieToGuess.overview, icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Image', value: 'Image du film', icon: <Camera className="w-5 h-5" /> }
  ] : [];

  const visibleHints = Math.min(Math.floor(attempts / 5) + 1, hints.length);
  const showImage = attempts >= 10;

  const handleGuess = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || !movieToGuess) return;

    if (guess.toLowerCase() === movieToGuess.title.toLowerCase()) {
      setGameWon(true);
      setMessage('🎉 Bravo ! Vous avez trouvé !');
    } else {
      setShake(true);
      setAttempts(prev => prev + 1);
      setMessage('❌ Ce n\'est pas le bon film.');
      setTimeout(() => setShake(false), 500);
    }
    setGuess('');
  }, [guess, movieToGuess]);

  const resetGame = useCallback(() => {
    if (movies.length > 0) {
      setMovieToGuess(movies[Math.floor(Math.random() * movies.length)]);
      setGuess('');
      setAttempts(0);
      setGameWon(false);
      setMessage('');
      setShowGallery(false);
    }
  }, [movies]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && gameWon) {
        resetGame();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [gameWon, resetGame]);

  const MovieGallery = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-['Playfair_Display']">Collection de Films</h2>
        <button
          onClick={() => setShowGallery(false)}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          Retour au jeu
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <div key={movie.id} className="hint-card rounded-xl overflow-hidden">
            <div className="h-48 relative">
              <img 
                src={movie.backdrop_path}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{movie.title}</h3>
              <p className="text-red-400 text-sm mb-1">{movie.release_date} • {movie.genre}</p>
              <p className="text-gray-400 text-sm">{movie.director}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen cinema-bg text-white flex items-center justify-center">
        <div className="text-2xl font-bold">Chargement des films...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cinema-bg text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="movie-card rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <Popcorn className="w-12 h-12 text-red-400" />
              <h1 className="text-4xl font-bold font-['Playfair_Display']">CinéQuiz</h1>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowGallery(!showGallery)}
                className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                title="Voir tous les films"
              >
                <Library className="w-6 h-6 text-red-400" />
              </button>
              <button
                onClick={resetGame}
                className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                title="Nouveau film"
              >
                <RefreshCcw className="w-6 h-6 text-red-400" />
              </button>
            </div>
          </div>

          {showGallery ? (
            <MovieGallery />
          ) : !gameWon && movieToGuess ? (
            <>
              <div className="grid gap-6 mb-8">
                {hints.slice(0, visibleHints).map((hint, index) => (
                  hint.name === 'Image' && showImage ? (
                    <div key={hint.name} className="movie-poster rounded-xl overflow-hidden">
                      <div className="aspect-video relative">
                        <img 
                          src={movieToGuess.backdrop_path}
                          alt="Indice visuel" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : hint.name !== 'Image' && (
                    <div
                      key={hint.name}
                      className="hint-card rounded-xl p-6 flex items-center gap-4"
                    >
                      <div className="p-3 rounded-full bg-red-500/20">
                        {hint.icon}
                      </div>
                      <div>
                        <p className="text-red-400 text-sm mb-1">{hint.name}</p>
                        <p className="text-lg font-medium">{hint.value}</p>
                      </div>
                    </div>
                  )
                ))}
              </div>

              <form onSubmit={handleGuess} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Quel est ce film ?"
                    className={`w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-lg ${
                      shake ? 'animate-shake' : ''
                    }`}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="w-full glow-effect bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-xl text-lg font-medium hover:from-red-600 hover:to-red-700 transition-all"
                >
                  Deviner
                </button>
              </form>
            </>
          ) : movieToGuess && (
            <div className="text-center space-y-8">
              <div className="movie-poster rounded-xl overflow-hidden">
                <div className="aspect-video relative">
                  <img 
                    src={movieToGuess.backdrop_path}
                    alt={movieToGuess.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm">
                <p className="text-3xl font-bold text-red-400 mb-4">{message}</p>
                <p className="text-xl mb-2">
                  Le film était : <span className="font-bold">{movieToGuess.title}</span>
                </p>
                <p className="text-gray-400">
                  Trouvé en {attempts + 1} essai{attempts !== 0 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={resetGame}
                className="glow-effect bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-8 rounded-xl text-lg font-medium hover:from-red-600 hover:to-red-700 transition-all inline-flex items-center gap-3"
              >
                <RefreshCcw className="w-5 h-5" />
                Nouvelle Partie
              </button>
            </div>
          )}

          {message && !gameWon && !showGallery && (
            <div className="mt-6 text-center text-red-400 font-medium text-lg">
              {message}
            </div>
          )}

          {!showGallery && (
            <div className="mt-8 text-center text-gray-400">
              Essais : {attempts} | Indices révélés : {visibleHints}/{hints.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;