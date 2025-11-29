import { Property } from '../models/property.models.js';
import { Listing } from '../models/listing.models.js';


const calculateSimilarityScore = (target, candidate) => {
  let score = 0;

  // size or area
  const sizeDiff = Math.abs(target.size - candidate.size);
  score += 3 / (1 + sizeDiff);   // Weighted heavily

  // beds
  const bedDiff = Math.abs(target.bedrooms - candidate.bedrooms);
  score += 2 / (1 + bedDiff);

  //bathrooms
  const bathDiff = Math.abs(target.bathrooms - candidate.bathrooms);
  score += 1.5 / (1 + bathDiff);

  //amenities
  let amenityScore = 0;
  for (const a in target.amenities) {
    if (target.amenities[a] === candidate.amenities[a]) {
      amenityScore += 0.2;
    }
  }
  score += amenityScore;

  
  const ageDiff = Math.abs(target.yearBuild - candidate.yearBuild);
  score += 1 / (1 + ageDiff);

  return score;
};


const estimatePrice = async (req, res) => {
  try {
    const { listingId } = req.params;

    // Get target listing
    const targetListing = await Listing.findById(listingId).populate("propertyId");
    if (!targetListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const targetProp = targetListing.propertyId;

    // === Fetch comparable listings (same locality + same type) ===
    const candidateListings = await Listing.find({
      status: { $in: ["active", "verified"] },
      _id: { $ne: listingId },
    }).populate({
      path: "propertyId",
      match: {
        "location.locality": targetProp.location.locality,
        "location.city": targetProp.location.city,
        "location.state": targetProp.location.state,
        propertyType: targetProp.propertyType,
      },
    });

    // Filter invalid populate results
    const validCandidates = candidateListings.filter(l => l.propertyId);

    if (validCandidates.length === 0) {
      return res.status(200).json({
        message: "No comparable properties found in your locality.",
        estimatedPrice: null,
        estimatedRent: null,
      });
    }

    // === SCORING ===
    const scored = validCandidates.map(listing => ({
      listing,
      score: calculateSimilarityScore(targetProp, listing.propertyId),
    }));

    // Sort by similarity
    scored.sort((a, b) => b.score - a.score);

    // Pick top 10
    const top10 = scored.slice(0, 10);

    // Extract prices
    const comparablePrices = top10.map(item => item.listing.propertyId.price);

    if (comparablePrices.length === 0) {
      return res.status(200).json({
        message: "No comparable price data available.",
        estimatedPrice: null,
        estimatedRent: null,
      });
    }

    // === Remove Outliers 
    const sorted = comparablePrices.slice().sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lower = q1 - iqr * 1.5;
    const upper = q3 + iqr * 1.5;

    const cleaned = sorted.filter(p => p >= lower && p <= upper);

    // Fallback if all values removed
    const finalSet = cleaned.length > 0 ? cleaned : sorted;

    // median price
    const mid = Math.floor(finalSet.length / 2);
    const median =
      finalSet.length % 2 !== 0
        ? finalSet[mid]
        : (finalSet[mid - 1] + finalSet[mid]) / 2;

    //  Normalize price 
    const perSqft = median / targetProp.size;
    const estimatedPrice = perSqft * targetProp.size;

    
    let estimatedRent = null;
    let estimatedSale = null;

    if (targetProp.propertyType === "rental") {
      estimatedRent = Math.round(estimatedPrice);
    } else {
      estimatedSale = Math.round(estimatedPrice);
    }

    return res.status(200).json({
      message: "Price estimated using realistic comparable market analysis.",
      estimatedPrice: estimatedSale,
      estimatedRent: estimatedRent,
      comparablesUsed: finalSet.length,
      similarProperties: top10.map(s => s.listing.propertyId),
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error during estimation" });
  }
};

export { estimatePrice };
