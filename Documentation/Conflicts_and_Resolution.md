# Conflicts and Resolutions

## Conflict 1: Easy Access vs. Verified Information
**Conflict:** Users want open access to property listings, but unverified listings might be misleading. At the same time, asking listers for too much verification could discourage them from posting.  

**Resolution:** Show basic property info to everyone, but only allow access to detailed info and contact details after the lister is verified. Use clear icons or labels to show which listings are verified, and let users filter listings by verification status.  

---

## Conflict 2: Open Platform vs. Maintaining Quality
**Conflict:** The platform should let anyone list properties to encourage participation, but too many low-quality or fraudulent listings hurt credibility. Too many restrictions might scare off genuine users.  

**Resolution:** Use automated checks for basic listing quality (like required fields, image quality, duplicate detection) and let users report suspicious listings. Start new listings with a “pending review” status and build credibility gradually through user interactions and admin verification.  

---

## Conflict 3: Privacy vs. Easy Communication
**Conflict:** Users need to contact listers, but sharing personal information openly can risk privacy or spam.  

**Resolution:** Provide an internal messaging system that hides personal details until both parties agree to share. Include secure inquiry forms and scheduling options so users can communicate safely without exposing their information immediately.  

---

## Conflict 4: Academic Project vs. Real-World Needs
**Conflict:** Real estate platforms usually integrate with maps, property databases, and government verification systems, but as an academic project, access to these is limited.  

**Resolution:** Use mock integrations and simulated responses to demonstrate how real services would work. Add placeholder data for maps and verification that can later be replaced with actual APIs, focusing on building a flexible architecture.  

---

## Conflict 5: Moderation vs. Neutrality
**Conflict:** The platform needs to prevent fake or inappropriate listings, but over-moderation might remove legitimate posts, while under-moderation allows bad content.  

**Resolution:** Combine automated filters for obvious problems with community-driven moderation. Provide clear guidelines, an appeal process, and reputation systems so verified and trustworthy users gain credibility over time.  

---

## Conflict 6: Scalability vs. Accuracy
**Conflict:** As the platform grows, keeping listings up-to-date becomes harder. Outdated info frustrates users, but constant updates strain system performance.  

**Resolution:** Use smart caching and automatic expiration for listings. Remind listers to update old listings and flag outdated ones automatically. For non-critical info, use eventual consistency, while keeping essential property details accurate in real time.  

---

## Conflict 7: Quick Access vs. Verification Detail
**Conflict:** Users want fast access to property information, but full verification takes time, which could slow the experience.  

**Resolution:** Show basic property details immediately and load verified info progressively. Verification can happen in the background without blocking users, and clear badges indicate the verification status. Offer quick previews with full details available on demand.  
