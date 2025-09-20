# User Stories & Scenarios

---

## User Story 1

**Front of the Card**  

As a visitor, I want to browse property listings so that I can explore available properties without an account. 

**Back of the Card**  

**Success Scenarios**  
- The homepage loads with a grid of featured properties (thumbnail, price, location).
- Users can click on a property to view details.

**Failure Scenarios**  
- **Backend database unavailable**  
  *Message:* `We’re experiencing technical difficulties. Please try again later.`  
- **User Browser crashes**  
  *Message:* `Your browser has crashed. Relaunch and try again.`  

---

## User Story 2

**Front of the Card**  

As a registered User, I want to save a property listing so that I can revisit it later.

**Back of the Card**  

**Success Scenarios**  
- Click “Save” on a property → Saved to user account under Saved Listings.
- Saved listings persist across sessions.

**Failure Scenarios**  
- **Database error saving data.**  
  *Message:* `Failed to save listing. Please try again.`  
- **User Not logged in.**  
  *Message:* `You must be logged in to save listings. Please log in or register.`  

---

## User Story 3

**Front of the Card**  

As a registered User, I want to filter properties by price range so that I can narrow down options.

**Back of the Card**  

**Success Scenarios**  
- Select min/max price → Listings update dynamically.

**Failure Scenarios**  
- **Invalid price entered (e.g., letters instead of numbers).**  
  *Message:* `Price must be a valid number.`  
- **Session expires during filtering.**  
  *Message:* `Your session has expired. Log in again to continue.`  

---

## User Story 4

**Front of the Card**  

As a registered seeker, I want to compare up to 2 or more properties so that I can make an informed decision.

**Back of the Card**  

**Success Scenarios**  
- Add 2 or more properties to comparison → Side-by-side view of key metrics (price, size, location).
- Comparison layout is clear on both desktop and mobile devices.

**Failure Scenarios**  
- **Comparison tool crashes.**  
  *Message:* `Comparison tool is unavailable. Please try again later.`  
- **User clicks Compare without selecting.**  
  *Message:* `Please select at least 2 properties to compare.`
- **If the seeker is logged out while selecting properties**  
  *Message:* `You can re-login. Your selected properties will not be erased.`

---

## User Story 5

**Front of the Card**  

As a registered seeker, I want to track my activity history so that I can review past searches and saved listings.

**Back of the Card**  

**Success Scenarios**  
- Access "Activity Log" → View search history, saved listings, and interactions.

**Failure Scenarios**  
- **Deleted activity history.**  
  *Message:* `No activity found. You may have cleared your history.`  
- **Unauthorized access to history.**  
  *Message:* `Your activity log is being accessed by an unauthorized user. Log out immediately.`

---

## User Story 6

**Front of the Card**  

As a visitor, I want to search for properties by location so that I can find listings in my preferred area.

**Back of the Card**  

**Success Scenarios**  
- Enter location in the search bar → Listings update to show properties in that location.
- Autocomplete suggests matching locations while typing.

**Failure Scenarios**  
- **Invalid or unrecognized location entered.**  
  *Message:* `No results found. Please try a different location.`  
- **Search service down.**  
  *Message:* `Search is currently unavailable. Please try again later.`

---
