import { Property } from '../models/property.models.js';
import { Listing } from '../models/listing.models.js';

const calculateSimilarityScore = (targetProperty, candidateProperty) => {
  let score = 0;

  // Size difference
  const sizeDifference = Math.abs(targetProperty.size - candidateProperty.size);
  score += 1 / (1 + sizeDifference); // Normalize and add to score

  // Bedrooms difference
  const bedroomsDifference = Math.abs(targetProperty.bedrooms - candidateProperty.bedrooms);
  score += 1 / (1 + bedroomsDifference);

  // Bathrooms difference
  const bathroomsDifference = Math.abs(targetProperty.bathrooms - candidateProperty.bathrooms);
  score += 1 / (1 + bathroomsDifference);

  // Amenities match
  for (const amenity in targetProperty.amenities) {
    if (targetProperty.amenities[amenity] === candidateProperty.amenities[amenity]) {
      score += 0.1;
    }
  }

  return score;
};

/**
 * @desc    Estimate rent and selling price for a given listing
 * @route   GET /api/estimate-price/:listingId
 * @access  Public
 */
const estimatePrice = async (req, res) => {
  try {
    const { listingId } = req.params;

    // 1. Find the target listing and its property
    const targetListing = await Listing.findById(listingId).populate('propertyId');
    if (!targetListing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    const targetProperty = targetListing.propertyId;

    // 2. Find candidate listings
    const candidateListings = await Listing.find({
      status: { $in: ['active', 'verified'] },
      _id: { $ne: listingId }, // Exclude the target listing itself
    }).populate({
      path: 'propertyId',
      match: {
        'location.locality': targetProperty.location.locality,
        'location.city': targetProperty.location.city,
        'location.state': targetProperty.location.state,
        'location.zipCode': targetProperty.location.zipCode,
        propertyType: targetProperty.propertyType,
      },
    });

    // Filter out listings where the property did not match
    const filteredCandidates = candidateListings.filter(l => l.propertyId);

    // 3. Calculate similarity scores
    const scoredCandidates = filteredCandidates.map(candidateListing => {
      const candidateProperty = candidateListing.propertyId;
      const score = calculateSimilarityScore(targetProperty, candidateProperty);
      return { listing: candidateListing, score };
    });

    // 4. Sort by score and take top 5
    scoredCandidates.sort((a, b) => b.score - a.score);
    const top5Candidates = scoredCandidates.slice(0, 5);

    // 5. Calculate average price
    if (top5Candidates.length === 0) {
      return res.status(200).json({
        message: 'Not enough similar properties found to provide an estimate.',
        estimatedPrice: null,
        estimatedRent: null,
      });
    }

    const totalPrice = top5Candidates.reduce((acc, curr) => acc + curr.listing.propertyId.price, 0);
    const averagePrice = totalPrice / top5Candidates.length;

    let estimatedPrice = null;
    let estimatedRent = null;

    if (targetProperty.propertyType === 'rental') {
      estimatedRent = averagePrice;
    } else {
      estimatedPrice = averagePrice;
    }

    res.status(200).json({
      message: 'Price estimated successfully.',
      estimatedPrice,
      estimatedRent,
      similarProperties: top5Candidates.map(c => c.listing.propertyId),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { estimatePrice };
