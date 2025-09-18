# Real Estate Listing Website – Requirements Specification

---

## 1. User Types

- **Visitor (Unregistered User)**
- **Registered User**
  - Buyer / Renter
  - Lister / Seller / Owner / Real Estate Agent
- **Admin**

**Justification**
- **Visitor (Unregistered User):** Allows browsing the properties without logging in, reducing a step of action for casual browsers.  
- **Registered User:** Supports personalization and persistence of data, ensuring better engagement and security.  
- **Buyer / Renter:** Provides demand-side features like saving properties and scheduling visits, supporting core system goals.  
- **Lister / Seller / Owner / Real Estate Agent:** Enables supply-side property management, keeping listings accurate and dynamic.  
- **Admin:** Ensures governance, fraud prevention, and overall system reliability through oversight.  

---

## 2. Functional Requirements

### 2.1 Visitor (Unregistered User)

#### Must Have
- The system shall allow visitors to **browse the website without logging in**.

#### Should Have
- The system shall restrict advanced features (e.g., **saving properties**, **comparing prices**, **viewing past prices**) for unregistered users.

**Justification**
- Browse without logging in: Increases potential users by reducing the barrier to entry.  
- Restrict advanced features: Implements access control and motivates registration.  

---

### 2.2 Registered User (Buyer / Renter)

#### Must Have
- The system shall allow buyers/renters to **log in securely**.
- The system shall require buyers/renters to **upload valid identity proof**.
- The system shall allow buyers/renters to **request property visits** from listers.
- The system shall allow buyers/renters to **save property details** for future reference.

#### Should Have
- The system shall allow buyers/renters to **view the previous price history** of a property.
- The system shall allow buyers/renters to **compare prices** of different properties.
- The system shall allow buyers/renters to **read and write reviews** about properties.

#### Could Have
- The system shall provide a **360° property view** feature.
- The system shall allow buyers/renters to **set alerts/notifications** for new properties matching their criteria.

**Justification**
- Secure login: Protects accounts and personal data.  
- Upload identity proof: Builds trust and ensures authenticity.  
- Request visits & save details: Enhances usability and engagement.  
- Price history & comparison: Improves decision-making.  
- Reviews: Adds credibility and social proof.  
- 360° view & alerts: Enhances user experience and retention.  

---

### 2.3 Registered User (Lister / Seller / Owner / Real Estate Agent)

#### Must Have
- The system shall allow listers to **log in securely**.
- The system shall require listers to **upload valid identity proof**.
- The system shall allow listers to **add, update, and delete property listings**.

#### Should Have
- The system shall allow listers to **view feedback and reviews** related to their properties.
- The system shall allow listers to **view requests** from buyers/renters.

**Justification**
- Secure login & verification: Ensures authenticity and prevents fraud.  
- Add/update/delete listings: Core functionality for property management.  
- View feedback & requests: Supports communication and service quality.  

---

### 2.4 Admin

#### Must Have
- The system shall allow admins to **log in securely**.
- The system shall allow admins to **verify listers and their documents**.
- The system shall allow admins to **manage user accounts** (suspend/ban users).
- The system shall allow admins to **detect fraudulent properties**.

#### Should Have
- The system shall allow admins to **view analytics** of listings and site usage.
- The system shall allow admins to **send notifications or announcements** to all users.

#### Could Have
- The system shall allow admins to **manage advertisements and promotions**.

**Justification**
- Secure login: Protects privileged functions.  
- Verification & fraud detection: Maintains trust and legality.  
- User/account management: Ensures platform integrity.  
- Analytics & communication: Supports growth and engagement.  
- Ads management: Adds monetization opportunities.  

---

## 3. Non-Functional Requirements

### Must Have
- **Performance**: The system shall respond to user requests within **2 seconds** under normal load.  
- **Scalability**: The system shall support at least **10,000 concurrent users**.  
- **Security**: The system shall store all **passwords in encrypted form**.  
- **Usability**: The system shall provide an **intuitive and user-friendly interface** for both technical and non-technical users.  
- **Reliability**: The system shall maintain at least **99.5% uptime per year**.  

### Should Have
- **Compatibility**: The system shall be accessible from both **desktop and mobile browsers**.  
- **Maintainability**: The system shall allow **easy updates** to property categories and features without downtime.  

**Justification**
- Performance & scalability: Ensures smooth experience and future growth.  
- Security: Protects sensitive data.  
- Usability & reliability: Increases trust and satisfaction.  
- Compatibility: Ensures accessibility across devices.  
- Maintainability: Supports continuous improvement.  

---

## 4. Domain Requirements

### Must Have
- The system shall comply with **real estate laws and regulations** of the operating country (e.g., **RERA compliance in India**).  
- The system shall ensure that only **verified property documents** (ownership papers, legal clearances) are uploaded and stored.  
- The system shall support multiple **property types** (residential, commercial, land, rentals).  
- The system shall maintain **accurate property location details using maps**.  
- The system shall retain **transaction and listing history** for legal and audit purposes.  
- The system shall ensure **data privacy** by protecting sensitive buyer/seller information (e.g., **GDPR compliance**).  

### Could Have
- The system shall support **currency and unit conversion** (e.g., INR/USD, sq. ft. / sq. meter).  

**Justification**
- Legal compliance & verified docs: Prevents fraud and builds trust.  
- Multiple property types & maps: Increases versatility and usability.  
- History retention: Supports audits and dispute resolution.  
- Data privacy: Protects user trust and ensures compliance.  
- Currency/unit conversion: Supports international users.  
