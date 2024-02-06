// Importing necessary modules
import express from 'express';
import * as mainController from '../controllers/mainController.js';

// Create a router object
const router = express.Router();

// Home page route
router.get('/', mainController.showMovies);
router.post('/search', mainController.searchMovies);
router.post('/save', mainController.saveMovie);
router.get('/watch/:id', mainController.watchMovie);
router.get('/delete/:id', mainController.deleteMovie);
router.post('/sort', mainController.sortMovies);
router.post('/sortYear', mainController.sortMoviesYear);
router.post('/sortRating', mainController.sortMoviesRating);
router.post('/sortWatches', mainController.sortWatches);
router.post('/reverse', mainController.reverse);
router.get('/filter', mainController.filterMovies);
// Export the router
export default router;