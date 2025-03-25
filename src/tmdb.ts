import axios from 'axios';

const TMDB_API_KEY = 'df60d54c483fea4d97ff538262cf2cc8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original'; // Changé pour avoir la meilleure qualité d'image

export type TMDBMovie = {
  id: number;
  title: string;
  release_date: string;
  director?: string;
  cast: string[];
  genre: string;
  overview: string;
  poster_path: string;
  backdrop_path: string; // Ajout du backdrop
};

async function getTotalPages(): Promise<number> {
  try {
    const response = await axios.get(`${BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'fr-FR',
      },
    });
    return response.data.total_pages;
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre total de pages:', error);
    return 1;
  }
}

export async function getPopularMovies(): Promise<TMDBMovie[]> {
  try {
    const totalPages = await getTotalPages();
    const pagesToFetch = Math.min(totalPages, 10);
    const allMovies: TMDBMovie[] = [];

    for (let page = 1; page <= pagesToFetch; page++) {
      const response = await axios.get(`${BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'fr-FR',
          page,
        },
      });

      const pageMovies = await Promise.all(
        response.data.results.map(async (movie: any) => {
          try {
            const credits = await axios.get(`${BASE_URL}/movie/${movie.id}/credits`, {
              params: {
                api_key: TMDB_API_KEY,
                language: 'fr-FR',
              },
            });

            const genres = await axios.get(`${BASE_URL}/movie/${movie.id}`, {
              params: {
                api_key: TMDB_API_KEY,
                language: 'fr-FR',
              },
            });

            const director = credits.data.crew.find((person: any) => person.job === 'Director');
            const cast = credits.data.cast.slice(0, 3).map((actor: any) => actor.name);

            const defaultImage = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80';

            return {
              id: movie.id,
              title: movie.title,
              release_date: new Date(movie.release_date).getFullYear(),
              director: director?.name || 'Non disponible',
              cast,
              genre: genres.data.genres[0]?.name || 'Non disponible',
              overview: movie.overview,
              poster_path: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : defaultImage,
              backdrop_path: movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : defaultImage,
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération des détails du film ${movie.id}:`, error);
            return null;
          }
        })
      );

      allMovies.push(...pageMovies.filter((movie): movie is TMDBMovie => movie !== null));
      
      if (page < pagesToFetch) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return allMovies;
  } catch (error) {
    console.error('Erreur lors de la récupération des films:', error);
    return [];
  }
}