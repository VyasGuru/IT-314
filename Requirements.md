

# Requirements for Real Estate Listing Website (With Priorities)

The system enables **visitors**, **registered users**, and **admins** to interact with real estate listings.

---

## 1. User Types

- **Visitor (Unregistered User)**
- **Registered User**
- **Buyer / Renter**
- **Lister / Seller / Owner / Real Estate Agent**
- **Admin**




# Functional Requirements for Real Estate Listing Website

The system enables **visitors**, **registered users**, and **admins** to interact with real estate listings.

---

## 2.1 Visitor (Unregistered User)

### ✅ Must Have
- The system shall allow visitors to **browse the website without logging in**.

### ⚠️ Should Have
- The system shall restrict advanced features (such as **saving properties**, **comparing prices**, and **viewing past prices**) for unregistered users.

---

## 2.2 Registered User (Buyer / Renter)

### ✅ Must Have
- The system shall allow buyers/renters to **log in securely**.  
- The system shall require buyers/renters to **upload valid identity proof**.  
- The system shall allow buyers/renters to **request property visits** from listers.  
- The system shall allow buyers/renters to **save property details** for future reference.  

### ⚠️ Should Have
- The system shall allow buyers/renters to **view the previous price history** of a property.  
- The system shall allow buyers/renters to **compare prices** of different properties.  
- The system shall allow buyers/renters to **read and write reviews** about properties.  

### 💡 Could Have
- The system shall provide a **360° property view** feature.  
- The system shall allow buyers/renters to **set alerts/notifications** for new properties matching their criteria.  

---

## 2.3 Registered User (Lister / Seller / Owner / Real Estate Agent)

### ✅ Must Have
- The system shall allow listers to **log in securely**.  
- The system shall require listers to **upload valid identity proof**.  
- The system shall allow listers to **add, update, and delete property listings**.  

### ⚠️ Should Have
- The system shall allow listers to **view feedback and reviews** related to their properties.  
- The system shall allow listers to **view requests** from buyers/renters.  

---

## 2.4 Admin

### ✅ Must Have
- The system shall allow admins to **log in securely**.  
- The system shall allow admins to **verify listers and their documents**.  
- The system shall allow admins to **manage user accounts** (suspend/ban users).  
- The system shall allow admins to **detect fraudulent properties**.  

### ⚠️ Should Have
- The system shall allow admins to **view analytics** of listings and site usage.  
- The system shall allow admins to **send notifications or announcements** to all users.  

### 💡 Could Have
- The system shall allow admins to **manage advertisements and promotions**.  

---

# Functional Requirements (Justifications)

## 2.1 Visitor (Unregistered User)
- **Browse without logging in**: Increases potential users by reducing the barrier to entry.  
- **Restrict advanced features**: Implements access control and motivates registration.  

## 2.2 Registered User (Buyer / Renter)
- **Secure login**: Protects accounts and personal data.  
- **Upload identity proof**: Builds trust and ensures authenticity.  
- **Request property visits**: Enables meaningful buyer–seller interaction.  
- **Save property details**: Improves usability by letting users revisit listings.  
- **View price history**: Increases transparency for better decisions.  
- **Compare property prices**: Provides decision-support tools.  
- **Read/write reviews**: Adds credibility and social proof.  
- **360° view**: Enhances user experience with immersive visualization.  
- **Set alerts/notifications**: Keeps users engaged with updates.  

## 2.3 Registered User (Lister / Seller / Owner / Real Estate Agent)
- **Secure login**: Protects listings and credentials.  
- **Upload identity proof**: Ensures verification and reduces fraud.  
- **Add/update/delete listings**: Provides essential CRUD operations.  
- **View feedback/reviews**: Supports improvement and reputation management.  
- **View requests**: Facilitates smooth communication with buyers/renters.  

## 2.4 Admin
- **Secure login**: Protects powerful privileges.  
- **Verify listers/documents**: Ensures trustworthiness.  
- **Manage user accounts**: Maintains platform integrity.  
- **Detect fraudulent properties**: Protects credibility of listings.  
- **View analytics**: Provides insights for improvement.  
- **Send notifications**: Enables mass communication.  
- **Manage ads/promotions**: Adds revenue generation.  





3. Non-Functional Requirements :-

Performance :
Must Have → The system shall respond to user requests within 2 seconds under normal load.


Scalability :
Must Have → The system shall support at least 10,000 concurrent users.


Security :
Must Have → The system shall store all passwords in encrypted form.


Usability :
Must Have → The system shall provide an intuitive and user-friendly interface for both technical and non-technical users.


Reliability :
Must Have → The system shall maintain at least 99.5% uptime per year.


Compatibility :
Should Have → The system shall be accessible from both desktop and mobile browsers.


Maintainability :
Should Have → The system shall allow easy updates to property categories and features without downtime.



3) Non-Functional Requirements (Justifications) :-
   
Performance – Respond within 2 seconds: Ensures smooth user experience, reducing bounce rates and keeping the platform responsive under normal load.


Scalability – Support 10,000 concurrent users: Guarantees system growth and stability as the user base expands, aligning with future demand.


Security – Store passwords in encrypted form: Protects user credentials from breaches, following best practices in information security.


Usability – Intuitive interface: Enhances accessibility for both technical and non-technical users, improving adoption and satisfaction.


Reliability – Maintain 99.5% uptime: Provides consistent availability, increasing user trust and supporting business continuity.


Compatibility – Accessible via desktop and mobile browsers: Expands reach and convenience, ensuring inclusivity across devices.


Maintainability – Easy updates without downtime: Facilitates adaptability to business changes while minimizing disruption for users.



4. Domain Requirements  :-
Must Have :
The system shall comply with real estate laws and regulations of the operating country (e.g., RERA compliance in India).


The system shall ensure that only verified property documents (ownership papers, legal clearances) are uploaded and stored.


The system shall support multiple property types such as residential, commercial, land, and rentals.


The system shall maintain accurate property location details using maps.


The system shall retain transaction and listing history for legal and audit purposes.


The system shall ensure data privacy by protecting sensitive buyer/seller information as per legal standards (e.g., GDPR).

Could Have :
The system shall support currency and unit conversion (e.g., INR/USD, sq. ft. / sq. meter) for different markets.



4) Domain Requirements (Justifications) :-

   
Comply with real estate laws/regulations: Ensures legality and trustworthiness of operations (e.g., RERA compliance in India).


Upload only verified property documents: Prevents fraud and protects buyers by ensuring document authenticity.


Support multiple property types: Increases system versatility and applicability across diverse real estate markets.


Accurate property location with maps: Improves usability and decision-making by giving precise geographical context.


Retain transaction and listing history: Supports audits, dispute resolution, and legal compliance.


Ensure data privacy as per legal standards: Protects sensitive buyer/seller information, ensuring compliance (e.g., GDPR).


Currency and unit conversion (Could Have): Enhances global usability by accommodating international users and markets.


