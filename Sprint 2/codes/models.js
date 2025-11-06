export const UserRole = {
  VISITOR: 'visitor',
  BUYER: 'buyer',
  RENTER: 'renter',
  LISTER: 'lister',
  ADMIN: 'admin'
};

export const VerificationStatus = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  NOT_SUBMITTED: 'not_submitted'
};

export const ListingStatus = {
  ACTIVE: 'active',
  HIDDEN: 'hidden',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

export const PropertyType = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  LAND: 'land',
  RENTAL: 'rental'
};

export const COLLECTIONS_SCHEMA = {
  users: {
    _id: 'ObjectId (PK)',
    firebase_uid: 'string (unique)',
    email: 'string',
    name: 'string',
    role: 'string (visitor|buyer|renter|lister|admin)',
    phone: 'string (optional)',
    profile_picture: 'string (optional)',
    verification_status: 'string (pending|verified|rejected|not_submitted)',
    two_factor_enabled: 'boolean',
    is_suspended: 'boolean',
    is_banned: 'boolean',
    created_at: 'Date',
    updated_at: 'Date'
  },

  properties: {
    _id: 'ObjectId (PK)',
    title: 'string',
    description: 'string',
    property_type: 'string (residential|commercial|land|rental)',
    current_price: 'number',
    price_history: [
      {
        price: 'number',
        changed_at: 'Date',
        reason: 'string'
      }
    ],
    location: {
      street: 'string',
      city: 'string',
      state: 'string',
      zip_code: 'string',
      country: 'string',
      geo: {
        type: 'string (Point)',
        coordinates: '[longitude, latitude]'
      }
    },
    bedrooms: 'number (optional)',
    bathrooms: 'number (optional)',
    area_sqft: 'number (optional)',
    year_built: 'number (optional)',
    amenities: ['string'],
    images: ['string'],
    documents: ['string'],
    virtual_tour_url: 'string (optional)',
    created_at: 'Date',
    updated_at: 'Date'
  },

  listings: {
    _id: 'ObjectId (PK)',
    property_id: 'ObjectId', 
    lister_firebase_uid: 'string', 
    status: 'string (active|hidden|pending|verified|rejected|expired)',
    views_count: 'number',
    verified_at: 'Date (optional)',
    verified_by_admin_uid: 'string (optional)',
    rejection_reason: 'string (optional)',
    expires_at: 'Date (optional)',
    created_at: 'Date',
    updated_at: 'Date'
  },

  verification_documents: {
    _id: 'ObjectId (PK)',
    user_firebase_uid: 'string', 
    document_type: 'string',
    document_url: 'string',
    status: 'string (pending|verified|rejected)',
    verified_at: 'Date (optional)',
    verified_by_admin_uid: 'string (optional)',
    rejection_reason: 'string (optional)',
    created_at: 'Date'
  },

  saved_listings: {
    _id: 'ObjectId (PK)',
    user_firebase_uid: 'string', 
    listing_id: 'ObjectId', 
    notes: 'string (optional)',
    saved_at: 'Date'
  },

  property_comparisons: {
    _id: 'ObjectId (PK)',
    user_firebase_uid: 'string', 
    property_ids: ['ObjectId'], 
    created_at: 'Date'
  },

  reviews: {
    _id: 'ObjectId (PK)',
    reviewer_firebase_uid: 'string', 
    target_type: 'string (property|lister)',
    target_id: 'string', // Can be ObjectId (property) or string (firebase_uid)
    rating: 'number (1-5)',
    comment: 'string',
    created_at: 'Date',
    updated_at: 'Date'
  },

  notifications: {
    _id: 'ObjectId (PK)',
    user_firebase_uid: 'string (optional, null for broadcast)',
    title: 'string',
    message: 'string',
    notification_type: 'string',
    is_read: 'boolean',
    created_at: 'Date'
  },

  audit_logs: {
    _id: 'ObjectId (PK)',
    user_firebase_uid: 'string (optional)',
    action: 'string',
    resource_type: 'string (optional)',
    resource_id: 'string (optional)',
    metadata: 'object',
    timestamp: 'Date'
  }
};
