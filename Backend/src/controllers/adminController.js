// controllers/adminController.js

// --- MOCK DATABASE ---
// This is a simple array to act as our database for now.
let mockReviews = [
  {
    _id: '111',
    text: 'This place was okay. Just average.',
  },
  {
    _id: '222',
    text: 'I hated it, it was really bad.',
  },
  {
    _id: '333',
    text: 'This is an AWFUL and STUPID place. Total garbage.',
  },
  {
    _id: '444',
    text: 'I loved it!',
  },
  {
    _id: '555',
    text: 'The owner is a moron and a total jerk.',
  },
];

// --- OUR "BAD WORD" LIST ---
// We will delete any review that contains these words.
const abusiveWordList = ['awful', 'stupid', 'garbage', 'moron', 'jerk'];

/**
 * @desc    Clean up all abusive reviews (as an Admin)
 * @route   POST /api/admin/cleanup
 * @access  Admin
 */
const cleanupAbusiveReviews = (req, res) => {
  try {
    console.log('--- Running Cleanup ---');
    console.log('Original reviews count:', mockReviews.length);

    const deletedReviewIds = [];

    // We use .filter() to create a NEW array that
    // only contains the reviews we want to KEEP.
    const cleanedReviews = mockReviews.filter((review) => {
      // Convert review text to lowercase to make checking easier
      const reviewText = review.text.toLowerCase();

      // We use .some() to check if *any* word from our abusive list
      // is .includes() in the review's text.
      const isAbusive = abusiveWordList.some((badWord) =>
        reviewText.includes(badWord)
      );

      // If it IS abusive...
      if (isAbusive) {
        console.log(`FLAGGED: Review ${review._id} ("${review.text}")`);
        deletedReviewIds.push(review._id);
        return false; // ...do NOT keep it (it gets deleted)
      }

      // If it is NOT abusive...
      return true; // ...KEEP it in the new array
    });

    // Now, we replace our old database with the new, clean array
    mockReviews = cleanedReviews;

    console.log('Cleanup complete. New reviews count:', mockReviews.length);

    // Send a success response
    res.status(200).json({
      message: 'Cleanup successful.',
      reviewsDeleted: deletedReviewIds.length,
      deletedIds: deletedReviewIds,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { cleanupAbusiveReviews };