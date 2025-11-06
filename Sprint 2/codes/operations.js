
import { ObjectId } from 'mongodb';
import { getDatabase } from './config.js';


export class DatabaseOperations {
  constructor() {
    this.client = null;
    this.db = null;
    this.initialized = false;
  }


  async init() {
    if (!this.initialized) {
      const { client, db } = await getDatabase();
      this.client = client;
      this.db = db;
      this.initialized = true;
    }
  }


  async close() {
    if (this.client) {
      await this.client.close();
      this.initialized = false;
    }
  }

  async createUser(userData) {
    await this.init();
    
    const now = new Date();
    userData.created_at = now;
    userData.updated_at = now;

    // Set defaults
    userData.verification_status = userData.verification_status || 'not_submitted';
    userData.two_factor_enabled = userData.two_factor_enabled || false;
    userData.is_suspended = userData.is_suspended || false;
    userData.is_banned = userData.is_banned || false;

    const result = await this.db.collection('users').insertOne(userData);
    userData._id = result.insertedId;
    return userData;
  }


  async getUserByFirebaseUid(firebaseUid) {
    await this.init();
    return await this.db.collection('users').findOne({ firebase_uid: firebaseUid });
  }

  async getUsersByRole(role, limit = 100) {
    await this.init();
    return await this.db.collection('users')
      .find({ role })
      .limit(limit)
      .toArray();
  }

  async updateUser(firebaseUid, updateData) {
    await this.init();
    
    updateData.updated_at = new Date();
    const result = await this.db.collection('users').updateOne(
      { firebase_uid: firebaseUid },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
  }

  async deleteUser(firebaseUid) {
    await this.init();
    const result = await this.db.collection('users').deleteOne({ firebase_uid: firebaseUid });
    return result.deletedCount > 0;
  }

  async createProperty(propertyData) {
    await this.init();
    
    const now = new Date();
    propertyData.created_at = now;
    propertyData.updated_at = now;

    if (!propertyData.price_history && propertyData.current_price) {
      propertyData.price_history = [{
        price: propertyData.current_price,
        changed_at: now,
        reason: 'Initial listing'
      }];
    }
    if (propertyData.location && 
        propertyData.location.latitude && 
        propertyData.location.longitude) {
      propertyData.location.geo = {
        type: 'Point',
        coordinates: [
          propertyData.location.longitude,
          propertyData.location.latitude
        ]
      };
    }

    const result = await this.db.collection('properties').insertOne(propertyData);
    propertyData._id = result.insertedId;
    return propertyData;
  }


  async getPropertyById(propertyId) {
    await this.init();
    return await this.db.collection('properties').findOne({ _id: new ObjectId(propertyId) });
  }

  async searchProperties(filters, limit = 100) {
    await this.init();
    const query = {};

    if (filters.search_term) {
      query.$text = { $search: filters.search_term };
    }

    if (filters.near_lon !== undefined && filters.near_lat !== undefined) {
      query['location.geo'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.near_lon, filters.near_lat]
          },
          $maxDistance: filters.max_dist_meters || 10000
        }
      };
    }

    if (filters.property_type) {
      query.property_type = filters.property_type;
    }

    if (filters.min_price !== undefined || filters.max_price !== undefined) {
      query.current_price = {};
      if (filters.min_price !== undefined) {
        query.current_price.$gte = filters.min_price;
      }
      if (filters.max_price !== undefined) {
        query.current_price.$lte = filters.max_price;
      }
    }

    if (filters.city) {
      query['location.city'] = { $regex: filters.city, $options: 'i' };
    }
    if (filters.state) {
      query['location.state'] = { $regex: filters.state, $options: 'i' };
    }

    if (filters.bedrooms !== undefined) {
      query.bedrooms = filters.bedrooms;
    }
    if (filters.min_bedrooms !== undefined) {
      query.bedrooms = { $gte: filters.min_bedrooms };
    }

    return await this.db.collection('properties')
      .find(query)
      .limit(limit)
      .toArray();
  }

  async updateProperty(propertyId, updateData) {
    await this.init();
    
    updateData.updated_at = new Date();

    if (updateData.current_price !== undefined) {
      const property = await this.getPropertyById(propertyId);
      if (property && property.current_price !== updateData.current_price) {
        await this.db.collection('properties').updateOne(
          { _id: new ObjectId(propertyId) },
          {
            $push: {
              price_history: {
                price: updateData.current_price,
                changed_at: new Date(),
                reason: updateData.price_change_reason || 'Price updated'
              }
            }
          }
        );
      }
    }

    if (updateData.location && 
        updateData.location.latitude && 
        updateData.location.longitude) {
      updateData.location.geo = {
        type: 'Point',
        coordinates: [
          updateData.location.longitude,
          updateData.location.latitude
        ]
      };
    }

    const result = await this.db.collection('properties').updateOne(
      { _id: new ObjectId(propertyId) },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
  }

  async deleteProperty(propertyId) {
    await this.init();
    const result = await this.db.collection('properties').deleteOne({ _id: new ObjectId(propertyId) });
    return result.deletedCount > 0;
  }

  async createListing(listingData) {
    await this.init();
    
    const now = new Date();
    listingData.created_at = now;
    listingData.updated_at = now;
    listingData.status = listingData.status || 'pending';
    listingData.views_count = listingData.views_count || 0;

    if (listingData.property_id && typeof listingData.property_id === 'string') {
      listingData.property_id = new ObjectId(listingData.property_id);
    }

    const result = await this.db.collection('listings').insertOne(listingData);
    listingData._id = result.insertedId;
    return listingData;
  }


  async getListingById(listingId, incrementView = false) {
    await this.init();
    
    if (incrementView) {
      await this.db.collection('listings').updateOne(
        { _id: new ObjectId(listingId) },
        { $inc: { views_count: 1 } }
      );
    }
    
    return await this.db.collection('listings').findOne({ _id: new ObjectId(listingId) });
  }

  async getListingsByStatus(status, limit = 100) {
    await this.init();
    return await this.db.collection('listings')
      .find({ status })
      .limit(limit)
      .toArray();
  }

  async getListingsByLister(listerFirebaseUid, limit = 100) {
    await this.init();
    return await this.db.collection('listings')
      .find({ lister_firebase_uid: listerFirebaseUid })
      .limit(limit)
      .toArray();
  }

  async updateListing(listingId, updateData) {
    await this.init();
    
    updateData.updated_at = new Date();

    if (updateData.status === 'verified' && !updateData.verified_at) {
      updateData.verified_at = new Date();
    }

    const result = await this.db.collection('listings').updateOne(
      { _id: new ObjectId(listingId) },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
  }

  async deleteListing(listingId) {
    await this.init();
    const result = await this.db.collection('listings').deleteOne({ _id: new ObjectId(listingId) });
    return result.deletedCount > 0;
  }

  async createVerificationDocument(docData) {
    await this.init();
    
    docData.created_at = new Date();
    docData.status = docData.status || 'pending';

    const result = await this.db.collection('verification_documents').insertOne(docData);
    docData._id = result.insertedId;
    return docData;
  }

  async verifyDocument(documentId, adminUid, status, rejectionReason = null) {
    await this.init();
    
    const session = this.client.startSession();
    
    try {
      await session.withTransaction(async () => {
        const updateData = {
          status,
          verified_by_admin_uid: adminUid,
          verified_at: new Date()
        };
        
        if (rejectionReason) {
          updateData.rejection_reason = rejectionReason;
        }

        const result = await this.db.collection('verification_documents').updateOne(
          { _id: new ObjectId(documentId) },
          { $set: updateData },
          { session }
        );

        if (result.modifiedCount === 0) {
          throw new Error(`Document ${documentId} not found or not modified.`);
        }

        if (status === 'verified') {
          const doc = await this.db.collection('verification_documents').findOne(
            { _id: new ObjectId(documentId) },
            { session }
          );
          
          if (doc && doc.document_type === 'identity_proof') {
            const userUpdateResult = await this.db.collection('users').updateOne(
              { firebase_uid: doc.user_firebase_uid },
              { $set: { verification_status: 'verified' } },
              { session }
            );
            
            if (userUpdateResult.modifiedCount === 0) {
              console.log(`User ${doc.user_firebase_uid} may already be verified.`);
            }
          }
        }
      });

      console.log('Transaction successful: Document and User updated.');
      return true;
    } catch (error) {
      console.error(`Transaction failed: ${error.message}`);
      return false;
    } finally {
      await session.endSession();
    }
  }

  async getPendingVerifications(limit = 100) {
    await this.init();
    return await this.db.collection('verification_documents')
      .find({ status: 'pending' })
      .limit(limit)
      .toArray();
  }

  async saveListing(userFirebaseUid, listingId, notes = null) {
    await this.init();
    
    const listingObjId = new ObjectId(listingId);

    const existing = await this.db.collection('saved_listings').findOne({
      user_firebase_uid: userFirebaseUid,
      listing_id: listingObjId
    });

    if (existing) {
      return existing;
    }

    const savedData = {
      user_firebase_uid: userFirebaseUid,
      listing_id: listingObjId,
      notes,
      saved_at: new Date()
    };

    const result = await this.db.collection('saved_listings').insertOne(savedData);
    savedData._id = result.insertedId;
    return savedData;
  }

  async getSavedListings(userFirebaseUid) {
    await this.init();
    return await this.db.collection('saved_listings')
      .find({ user_firebase_uid: userFirebaseUid })
      .toArray();
  }

  async removeSavedListing(savedId) {
    await this.init();
    const result = await this.db.collection('saved_listings').deleteOne({ _id: new ObjectId(savedId) });
    return result.deletedCount > 0;
  }

  async createNotification(notificationData) {
    await this.init();
    
    notificationData.created_at = new Date();
    notificationData.is_read = notificationData.is_read || false;

    const result = await this.db.collection('notifications').insertOne(notificationData);
    notificationData._id = result.insertedId;
    return notificationData;
  }

  async getNotifications(userFirebaseUid) {
    await this.init();
    const query = {
      $or: [
        { user_firebase_uid: userFirebaseUid },
        { user_firebase_uid: null }
      ]
    };
    
    return await this.db.collection('notifications')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
  }


  async markNotificationRead(notificationId) {
    await this.init();
    const result = await this.db.collection('notifications').updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { is_read: true } }
    );
    return result.modifiedCount > 0;
  }

  async createAuditLog(logData) {
    await this.init();
    
    logData.timestamp = new Date();
    logData.metadata = logData.metadata || {};

    const result = await this.db.collection('audit_logs').insertOne(logData);
    logData._id = result.insertedId;
    return logData;
  }


  async getAuditLogs(filters = {}, limit = 100) {
    await this.init();
    return await this.db.collection('audit_logs')
      .find(filters)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  // ANALYTICS OPERATIONS
  async getAnalytics() {
    await this.init();
    
    const [
      totalUsers,
      totalProperties,
      totalListings,
      activeListings,
      pendingVerifications
    ] = await Promise.all([
      this.db.collection('users').countDocuments(),
      this.db.collection('properties').countDocuments(),
      this.db.collection('listings').countDocuments(),
      this.db.collection('listings').countDocuments({ status: 'active' }),
      this.db.collection('verification_documents').countDocuments({ status: 'pending' })
    ]);

    return {
      total_users: totalUsers,
      total_properties: totalProperties,
      total_listings: totalListings,
      active_listings: activeListings,
      pending_verifications: pendingVerifications
    };
  }
}
