// -----------------------------
// asyncHandler Utility Function
// -----------------------------
//
// Purpose:
// This utility function is used to simplify error handling in asynchronous 
// Express route handlers or controllers. Instead of writing try-catch blocks 
// in every async function, we can wrap the function using asyncHandler, which 
// automatically catches and forwards errors to Express’s built-in error middleware.
//

// The asyncHandler function takes another function (fn) as an argument
const asyncHandler = (fn) => {

    // It returns a new function that Express will call whenever this route runs
    return (req, res, next) => {

        // Promise.resolve ensures fn() runs as a promise (even if it's async)
        // If fn() throws an error or rejects, .catch() will catch it
        // and pass it to 'next(err)', which triggers the global error handler
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };
};

// Export the asyncHandler so it can be imported and used in controllers
export { asyncHandler };
