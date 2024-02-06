// Importing Mongoose
import mongoose from 'mongoose';

// Creating the Game Schema
const movieSchema = new mongoose.Schema({
    poster: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
  year: {
        type: String,
    },
    actors: {
        type: String,
        required: true
    },
    plot: {
        type: String
    },
    language:
    {
      type: String
    },
  imdbRating:
  {
    type: String
  },
  timesWatched: { 
    type: Number, 
    default: 0 
  }
});

// Creating the Game model
const Movie = mongoose.model('Movie', movieSchema);

// Exporting the model
export default Movie;
