https://powcoder.com
代写代考加微信 powcoder
Assignment Project Exam Help
Add WeChat powcoder
import express, { json, Request, Response } from 'express';
import cors from 'cors';

// OPTIONAL: Use middleware to log (print to terminal) incoming HTTP requests
import morgan from 'morgan';

// Importing the example implementation for echo in echo.js
import { echo } from './echo';
import { PORT, SERVER_URL } from './config';

// COMP1531 middleware - must use AFTER declaring your routes
import errorHandler from 'middleware-http-errors';

const app = express();

// Use middleware that allows for access from other domains (needed for frontend to connect)
app.use(cors());
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// (OPTIONAL) Use middleware to log (print to terminal) incoming HTTP requests
app.use(morgan('dev'));

// Root URL
app.get('/', (req: Request, res: Response) => {
  console.log('Print to terminal: someone accessed our root url!');
  res.json(
    {
      message: "Welcome to Lab08 Quiz Server's root URL!",
    }
  );
});

app.get('/echo/echo', (req: Request, res: Response) => {
  // For GET/DELETE request, parameters are passed in a query string.
  // You will need to typecast for GET/DELETE requests.
  const message = req.query.message as string;

  // Logic of the echo function is abstracted away in a different
  // file called echo.py.
  res.json(echo(message));
});

app.post('/quiz/create', (req: Request, res: Response) => {
  // For PUT/POST requests, data is transfered through the JSON body
  const { quizTitle, quizSynopsis } = req.body;

  // TODO: Implement
  console.log('Do something with:', quizTitle, quizSynopsis);
  res.json({ quizId: -999999 });
});

// TODO: Remaining routes

// COMP1531 middleware - must use AFTER declaring your routes
app.use(errorHandler());

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Starting Express Server at the URL: '${SERVER_URL}'`);
});
