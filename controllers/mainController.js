import Movie from '../models/Movie.js';
let savedMovies, totalMovies, totalTimesWatched, sortCriteria = { title: 1 };

export const showMovies = async (req, res) => {
  await aggregateMoviesData();
  savedMovies = await Movie.find().sort(sortCriteria);
  res.render('index', { savedMovies, totalMovies, totalTimesWatched });
}

export const searchMovies = async (req, res) => {
  const movieTitle = req.body.movieTitle;
  try {
    const response = await fetch(`http://www.omdbapi.com/?t=${movieTitle}&apikey=${process.env.MOVIE_KEY}`);
    const movie = await response.json();
    console.log(movie.Response);
    if (movie.Response == "False")
      {
        req.flash('info', 'No movies found, try again!');
        res.redirect('/');
      }
    else
      {
        res.render('results', {movie});
      }
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
};

export const saveMovie = async (req, res) => {
  const { title, poster, year, actors, plot, language, imdbRating } = req.body;

  try {
    // Check if the movie already exists in the database
    let movie = await Movie.findOne({ title: title });

    if (movie) {
      // If movie exists, increment the timesWatched
      movie.timesWatched += 1;
      await movie.save();
    } else {
      // If movie doesn't exist, create a new one
      movie = new Movie({
        title,
        poster,
        year,
        actors,
        plot,
        language,
        imdbRating,
        timesWatched: 1
      });
      await movie.save();
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const watchMovie = async (req, res) => {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findById(movieId);
    if (movie) {
      movie.timesWatched += 1;
      await movie.save();
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const deleteMovie = async (req, res) => {
  const movieId = req.params.id;

  try {
    const result = await Movie.findByIdAndDelete(movieId);
    console.log(result);
    req.flash('info', `deleted '${result.title}'`);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const sortMovies = async (req, res) => {
  try {
    sortCriteria = { title: 1 };
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const sortMoviesYear = async (req, res) => {
  try {
    sortCriteria = { year: 1 };
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const filterMovies = async (req, res) => {
  const { actors, title, ratingFrom, ratingTo, yearFrom, yearTo, languages } = req.query;

   let query = {};

  // Check and construct query for actors
  if (actors) {
    // Split the actors string into an array of trimmed names
    const actorsPattern = actors.split(',').map(actor => actor.trim()).join('|');
    query.actors = { $regex: actorsPattern, $options: 'i' }; // Case-insensitive match
  }
  if (title) {
    query.title = { $regex: title, $options: 'i' }; // Case-insensitive search
  }
  if (ratingFrom) {
    query.rating = { ...query.rating, $gte: parseFloat(ratingFrom) };
  }
  if (ratingTo) {
    query.rating = { ...query.rating, $lte: parseFloat(ratingTo) };
  }
  if (yearFrom) {
    query.year = { ...query.year, $gte: parseInt(yearFrom) };
  }
  if (yearTo) {
    query.year = { ...query.year, $lte: parseInt(yearTo) };
  }
  if (languages) {
    // Split the actors string into an array of trimmed names
    const languagesPattern = languages.split(',').map(actor => actor.trim()).join('|');
    query.language = { $regex: languagesPattern, $options: 'i' }; // Case-insensitive match
  }

  try {
    const movies = await Movie.find(query); // Use constructed query for filtering

    // Additional processing or direct response
    res.render('index', { savedMovies: movies, totalMovies: movies.length, totalTimesWatched });
  } catch (error) {
    console.error('Failed to filter movies:', error);
    res.status(500).send('Error filtering movies');
  }
};

export const reverse = async (req, res) => {
  try {
    if ('imdbRating' in sortCriteria) {
      sortCriteria.imdbRating = sortCriteria.imdbRating * -1;
    } else if ('year' in sortCriteria) {
      sortCriteria.year = sortCriteria.year * -1;
    } else if ('timesWatched' in sortCriteria) {
      sortCriteria.timesWatched = sortCriteria.timesWatched * -1;
    } else if ('title' in sortCriteria) {
      // For 'title', since it's not numeric, you would typically toggle between 1 and -1, not multiply
      sortCriteria.title = sortCriteria.title === 1 ? -1 : 1;
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};
export const sortMoviesRating = async (req, res) => {
  try {
    sortCriteria = { imdbRating: -1 };
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const sortWatches = async (req, res) => {
  try {
    sortCriteria = { timesWatched: -1 };
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};


const aggregateMoviesData = async () => {
  try {
    const result = await Movie.aggregate([
      {
        $group: {
          _id: null, // Grouping without a specific field to aggregate all documents
          totalMovies: { $sum: 1 }, // Counting the total number of movies
          totalTimesWatched: { $sum: "$timesWatched" } // Summing up all timesWatched values
        }
      }
    ]);

    if (result.length > 0) {
      // Extracting the result from the first element of the result array
      totalMovies = result[0].totalMovies;
      totalTimesWatched = result[0].totalTimesWatched;
      console.log(`Total Movies: ${totalMovies}, Total Times Watched: ${totalTimesWatched}`);
    } else {
      console.log("No data found.");
    }
  } catch (error) {
    console.error("Error aggregating movie data:", error);
  }
};