// Import authentication-related functions from the service layer.
// The controller will call these functions to perform the actual business logic.
import {
  getMe,
  loginUser,
  registerUser
} from "../services/authService.js";


// ======================================================
// REGISTER USER
// ======================================================

// `export` → makes this controller available to the routes file.
// `register` → name of the controller function.
// `async` → allows us to use `await`.
// `req` → contains the request/data sent by the frontend.
// `res` → used to send a response back to the frontend.
// `next` → passes errors to the Express error-handling middleware.
export const register = async (req, res, next) => {
  try {

    // `req.body` contains the registration data sent by the frontend.
    //
    // Example:
    // {
    //   name: "Nishant",
    //   email: "nishant@gmail.com",
    //   password: "Admin12345"
    // }
    //
    // Send this data to the service layer.
    const result = await registerUser(req.body);

    // Send the result back to the frontend.
    // HTTP 201 means "Created".
    res.status(201).json(result);

  } catch (error) {

    // If something goes wrong, send the error
    // to the centralized Express error middleware.
    next(error);
  }
};


// ======================================================
// LOGIN USER
// ======================================================

export const login = async (req, res, next) => {
  try {

    // `req.body` contains the login information.
    //
    // Example:
    // {
    //   email: "nishant@gmail.com",
    //   password: "Admin12345"
    // }
    //
    // Send login data to the auth service.
    const result = await loginUser(req.body);

    // Send the login result to the frontend.
    //
    // If login is successful, the result may contain:
    // {
    //   user: {...},
    //   token: "JWT_TOKEN"
    // }
    //
    // `res.json()` automatically sends HTTP 200.
    res.json(result);

  } catch (error) {

    // Pass any error to the Express error middleware.
    next(error);
  }
};


// ======================================================
// GET CURRENT LOGGED-IN USER
// ======================================================

export const me = async (req, res, next) => {
  try {

    // `req.user` is normally added by authentication middleware
    // after verifying the JWT token.
    //
    // Example:
    // req.user = {
    //   id: 5,
    //   role: "ADMIN"
    // }
    //
    // `req.user.id` gives us the ID of the logged-in user.
    //
    // Send that ID to the getMe service.
    const user = await getMe(req.user.id);

    // Send the user's information back to the frontend.
    //
    // Response:
    // {
    //   "user": {
    //      "id": 5,
    //      "name": "Nishant",
    //      "email": "nishant@gmail.com"
    //   }
    // }
    res.json({ user });

  } catch (error) {

    // Pass errors to the centralized error middleware.
    next(error);
  }
};