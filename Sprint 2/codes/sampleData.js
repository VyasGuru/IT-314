import { ObjectId } from 'mongodb';
import { DatabaseOperations } from './operations.js';
import { UserRole, PropertyType, ListingStatus } from './models.js';

async function insertSampleUsers(dbOps) {
  console.log('\nInserting sample users...');

  const users = [
    {
      firebase_uid: 'firebase_buyer_001',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      role: UserRole.BUYER,
      phone: '+1234567890',
      verification_status: 'verified'
    },
    {
      firebase_uid: 'firebase_buyer_002',
      email: 'bob@example.com',
      name: 'Bob Williams',
      role: UserRole.BUYER,
      phone: '+1234567891'
    },
    {
      firebase_uid: 'firebase_lister_001',
      email: 'agent1@realty.com',
      name: 'Sarah Agent',
      role: UserRole.LISTER,
      phone: '+1234567892',
      verification_status: 'verified'
    },
    {
      firebase_uid: 'firebase_lister_002',
      email: 'agent2@realty.com',
      name: 'Mike Broker',
      role: UserRole.LISTER,
      phone: '+1234567893',
      verification_status: 'verified'
    },
    {
      firebase_uid: 'firebase_admin_001',
      email: 'admin@realestate.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      verification_status: 'verified'
    }
  ];

  for (const userData of users) {
    try {
      const existing = await dbOps.getUserByFirebaseUid(userData.firebase_uid);
      if (!existing) {
        await dbOps.createUser(userData);
        console.log(`  ✓ Created user: ${userData.name}`);
      } else {
        console.log(`  - Skipping user (already exists): ${userData.name}`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to create ${userData.name}: ${error.message}`);
    }
  }
}

async function insertSampleProperties(dbOps) {
  console.log('\nInserting sample properties...');

  const properties = [
    {
      title: 'Modern 3BR House in Downtown Austin',
      description: 'Beautiful modern home with open floor plan, granite countertops, and stainless steel appliances. Walking distance to restaurants and shops.',
      property_type: PropertyType.RESIDENTIAL,
      current_price: 525000.00,
      location: {
        street: '456 Congress Ave',
        city: 'Austin',
        state: 'TX',
        zip_code: '78701',
        country: 'USA',
        latitude: 30.2672,
        longitude: -97.7431
      },
      bedrooms: 3,
      bathrooms: 2.5,
      area_sqft: 2200,
      year_built: 2019,
      amenities: ['pool', 'garage', 'central_ac', 'hardwood_floors']
    },
    {
      title: 'Luxury 4BR Villa with Pool',
      description: 'Stunning luxury villa in prestigious Dallas neighborhood. Features include chef\'s kitchen, wine cellar, and resort-style pool.',
      property_type: PropertyType.RESIDENTIAL,
      current_price: 875000.00,
      location: {
        street: '789 Highland Park',
        city: 'Dallas',
        state: 'TX',
        zip_code: '75205',
        country: 'USA',
        latitude: 32.7767,
        longitude: -96.7970
      },
      bedrooms: 4,
      bathrooms: 3.5,
      area_sqft: 3800,
      year_built: 2020,
      amenities: ['pool', 'garage', 'wine_cellar', 'smart_home', 'security_system']
    },
    {
      title: 'Cozy 2BR Apartment in Houston',
      description: 'Perfect starter home or investment property. Recently renovated with new appliances and flooring.',
      property_type: PropertyType.RENTAL,
      current_price: 1800.00,
      location: {
        street: '123 Montrose Blvd',
        city: 'Houston',
        state: 'TX',
        zip_code: '77006',
        country: 'USA',
        latitude: 29.7604,
        longitude: -95.3698
      },
      bedrooms: 2,
      bathrooms: 2,
      area_sqft: 1200,
      year_built: 2015,
      amenities: ['parking', 'gym', 'laundry']
    }
  ];

  const createdPropertyIds = {};

  for (const propData of properties) {
    try {
      const existing = await dbOps.db.collection('properties').findOne({ title: propData.title });
      if (!existing) {
        const createdProp = await dbOps.createProperty(propData);
        console.log(`  ✓ Created property: ${createdProp.title}`);
        createdPropertyIds[propData.title] = createdProp._id.toString();
      } else {
        console.log(`  - Skipping property (already exists): ${propData.title}`);
        createdPropertyIds[propData.title] = existing._id.toString();
      }
    } catch (error) {
      console.error(`  ✗ Failed to create ${propData.title}: ${error.message}`);
    }
  }

  return createdPropertyIds;
}

async function insertSampleListings(dbOps, createdPropertyIds) {
  console.log('\nInserting sample listings...');

  const propIdMap = {
    'prop_austin_001': createdPropertyIds['Modern 3BR House in Downtown Austin'],
    'prop_dallas_001': createdPropertyIds['Luxury 4BR Villa with Pool'],
    'prop_houston_001': createdPropertyIds['Cozy 2BR Apartment in Houston']
  };

  const listings = [
    {
      property_id_key: 'prop_austin_001',
      lister_firebase_uid: 'firebase_lister_001',
      status: ListingStatus.ACTIVE
    },
    {
      property_id_key: 'prop_dallas_001',
      lister_firebase_uid: 'firebase_lister_001',
      status: ListingStatus.ACTIVE
    },
    {
      property_id_key: 'prop_houston_001',
      lister_firebase_uid: 'firebase_lister_002',
      status: ListingStatus.ACTIVE
    }
  ];

  for (const listingData of listings) {
    try {
      const propId = propIdMap[listingData.property_id_key];
      if (!propId) {
        console.log(`  - Skipping listing, property not found: ${listingData.property_id_key}`);
        continue;
      }

      listingData.property_id = propId;
      delete listingData.property_id_key;

      const existing = await dbOps.db.collection('listings').findOne({
        property_id: new ObjectId(propId),
        lister_firebase_uid: listingData.lister_firebase_uid
      });

      if (!existing) {
        await dbOps.createListing(listingData);
        console.log(`  ✓ Created listing for property: ${propId}`);
      } else {
        console.log(`  - Skipping listing (already exists) for property: ${propId}`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to create listing: ${error.message}`);
    }
  }
}

async function insertSampleReviews(dbOps) {
  console.log('\nInserting sample reviews...');
  console.log('  (Review insertion skipped - requires fetching live _ids)');
}


async function populateDatabase() {
  console.log('='.repeat(60));
  console.log(' POPULATING DATABASE WITH SAMPLE DATA '.padStart(45));
  console.log('='.repeat(60));

  const dbOps = new DatabaseOperations();

  try {
    await dbOps.init();

    // Insert data
    await insertSampleUsers(dbOps);
    const createdPropertyIds = await insertSampleProperties(dbOps);
    await insertSampleListings(dbOps, createdPropertyIds);
    await insertSampleReviews(dbOps);

    // Show analytics
    console.log('\n' + '='.repeat(60));
    console.log(' DATABASE SUMMARY '.padStart(38));
    console.log('='.repeat(60));

    const analytics = await dbOps.getAnalytics();
    console.log(`\n  Total Users: ${analytics.total_users}`);
    console.log(`  Total Properties: ${analytics.total_properties}`);
    console.log(`  Total Listings: ${analytics.total_listings}`);
    console.log(`  Active Listings: ${analytics.active_listings}`);
    console.log(`  Pending Verifications: ${analytics.pending_verifications}`);

    console.log('\n' + '='.repeat(60));
    console.log(' SAMPLE DATA LOADED SUCCESSFULLY! '.padStart(45));
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error(`\n✗ Error populating database: ${error.message}`);
    console.error(error.stack);
  } finally {
    await dbOps.close();
    console.log('✓ MongoDB connection closed.');
  }
}


  populateDatabase();


export { populateDatabase, insertSampleUsers, insertSampleProperties, insertSampleListings };
