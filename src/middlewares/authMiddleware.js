// middleware/authMiddleware.js

// This is our simulated admin check
const checkAdmin = (req, res, next) => {
  console.log('Checking for admin role...');

  // --- THIS IS NOT SECURE FOR PRODUCTION ---
  // We are just checking for a "header" in the request.
  if (req.headers['x-user-role'] === 'admin') {
    console.log('Admin role confirmed!');
    // The user is an admin! Continue to the next function (the controller).
    next();
  } else {
    console.log('Access denied. Not an admin.');
    // The user is NOT an admin. Send an error and stop.
    res.status(403).json({ message: 'Access Denied: Admin role required.' });
  }
};

export { checkAdmin };