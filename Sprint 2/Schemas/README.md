# Database Schema

## Overview

This folder contains all the **MongoDB schema definitions** and the **Entity Relationship (ER) diagram** for our Real Estate Listing Web Application.  
---

## Folder Structure

```
schema/
│
├── auditLog.js
├── listing.js
├── notification.js
├── property.js
├── propertyComparison.js
├── review.js
├── savedListing.js
├── user.js
├── verificationDocument.js
└── Schema.pdf
```

---

## Description of Schema Files

### **1. user.js**
Defines user details and roles (visitor, buyer, renter, lister, admin).  
Tracks account status, verification state, and timestamps.

### **2. property.js**
Represents property details such as type, pricing history, location, amenities, and metadata.

### **3. listing.js**
Links a property to a lister (user).  
Maintains listing status (active, verified, rejected, etc.) and activity details like views and expiration.

### **4. savedListing.js**
Stores user-saved listings for later reference, supporting personalized property tracking.

### **5. review.js**
Allows users to post reviews either for a **property** or a **lister**, including ratings and comments.

### **6. propertyComparison.js**
Enables users to compare multiple properties side-by-side.

### **7. notification.js**
Handles system, verification, and listing-related notifications for users.

### **8. verificationDocument.js**
Manages documents submitted for verification (identity proof, property ownership, etc.) and their approval status.

### **9. auditLog.js**
Records all user actions (e.g., updates, deletions, submissions) for accountability and debugging.

---

## ER Diagram

The pdf Schema.pdf contains the ER diagram
