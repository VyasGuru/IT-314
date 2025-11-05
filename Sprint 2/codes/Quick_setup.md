# Real Estate Database Initialization Guide

## Overview

This folder contains all scripts required to **initialize, configure, and populate** the MongoDB database used in the *Real Estate Listing Platform* project.  

The setup automates:
1. **Connection and configuration** of the MongoDB client.
2. **Creation of indexes** and optimized query structures.
3. **Insertion of sample data** (users, properties, listings).
4. **Validation and analytics** to verify database readiness.

---

## Folder Structure

```
codes/
│
├── config.js              
├── initDb.js              
├── models.js              
├── operations.js          
├── sampleData.js         
├── test_connection.js     
├── package.json          
```

---

## Prerequisites

### 1. Install Dependencies
Ensure you have **Node.js (v18+)** and **MongoDB (v6+)** installed locally.

Then, install the required dependencies:

```bash
npm install
```

### 2. Setup MongoDB Environment
You can either:
- Use a **local MongoDB instance**, or  
- Provide a remote **MongoDB Atlas connection string**.

Create a `.env` file in this folder (optional) with the following keys:

```
MONGO_URL=mongodb://localhost:27017/
DB_NAME=real_estate_db
```

If `.env` is not present, the system defaults to the above local configuration.

---

## Initialization Workflow

The recommended setup flow is:

### Step 1: Test MongoDB Connection
Run the test script to confirm your MongoDB setup works properly.

```bash
node test_connection.js
```

**Expected Output:**
```
SUCCESS: Connected to MongoDB server!
Successfully inserted test document with _id: ...
All tests passed! Your connection is working.
```

---

### Step 2: Initialize Database and Indexes
Run the database initialization script to create collections and indexes.

```bash
npm run init-db
```

This script:
- Connects to your MongoDB instance.
- Creates optimized indexes for all collections (`users`, `properties`, `listings`, etc.).
- Prints a summary of all created collections and their document counts.

**Example Output:**
```
Creating indexes for 'users' collection...
Users indexes created
Creating indexes for 'properties' collection...
Properties indexes created
...
All indexes created successfully!
```

---

### Step 3: Populate with Sample Data
Once the database is initialized, load the predefined sample dataset:

```bash
npm run sample-data
```

This will:
- Create sample **users** (buyers, listers, admins).
- Insert **property records** with location and pricing details.
- Link them to **listings** posted by verified listers.
- Display a **database summary** report.

**Example Output:**
```
POPULATING DATABASE WITH SAMPLE DATA
✓ Created user: Alice Johnson
✓ Created property: Modern 3BR House in Downtown Austin
✓ Created listing for property: prop_austin_001
DATABASE SUMMARY
  Total Users: 5
  Total Properties: 3
  Total Listings: 3
  Active Listings: 3
  Pending Verifications: 0
SAMPLE DATA LOADED SUCCESSFULLY!
```

---

### Step 4: Verify Indexes and Collections
You can verify all created collections and indexes manually in the Mongo shell or Compass:

```bash
show dbs
use real_estate_db
show collections
db.users.getIndexes()
db.properties.find().pretty()
```

---
## Summary

After running the above scripts:
- Your MongoDB database **`real_estate_db`** will be fully initialized.
- All **indexes**, **collections**, and **sample data** will be ready.
