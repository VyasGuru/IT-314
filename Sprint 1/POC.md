# POC For Sprint - 1

## Executive Summary
Our first sprint focuses on building the foundation of our real estate listing website. We tackled two core pieces: user authentication (**Epic 3**) and the landing page (**Epic 1**).  

Initially, we planned to keep these components separate, but later on we ended up integrating them together to see how they'd work as a unified experience. The result was pretty satisfying.  

We implemented **Google authentication** for our login system, which allows users to directly use their Google account to log in — a secure way to access the platform. The landing page came together using **React, HTML, CSS, and JavaScript**, creating a clean and simple interface.  

The key output of the sprint was the successful implementation of the **landing page integrated with our login functionality**.

---

## Background & Objectives
We needed to validate that our core understanding and concepts of the project were well planned before diving into the implementation. Sprint 1 was about proving we have a broad understanding of the project by:  

- Gathering all the requirements along with stakeholders  
- Getting users logged in securely  
- Giving them a clean and simple homepage to explore properties  

We divided the sprint into 3 main phases:

1. **Documentation Phase**  
   - We spent time as a group really understanding what we were building.  
   - Identified stakeholders, mapped out user stories, worked through functional and non-functional requirements, and defined our epics.  

2. **Design & Implementation Phase**  
   - Used Figma to design our interfaces.  
   - Built the login system using Google authentication.  
   - Developed the landing page with React, HTML, CSS, and JavaScript.  

3. **Integration Phase**  
   - Initially planned to keep login and landing page separate.  
   - Later decided to integrate them to see how they worked together, giving us a more complete picture of the experience.  

We successfully created:  
- A working authentication system that lets users sign in with their Google accounts.  
- A landing page that provides a clean, welcoming interface giving users a good sense of what the platform offers.  
- Smooth integration between login and landing page.  

---

## Technical Architecture and Implementation
Our Sprint 1 architecture follows a straightforward client-side approach that keeps everything running smoothly in the browser while using Google for authentication.  

We built two main components:  
- **Authentication**  
- **Landing Page**  

These work independently but integrate seamlessly.  

---

## Technology Stack

### Frontend Foundation
- **React** → Component-based architecture for clean, maintainable UI development.  
- **Tailwind CSS** → Utility classes for consistent styling without custom CSS issues.  
- **Vite** → Lightning-fast development with hot module replacement and optimized builds.  
- **Lucide** → Professional, consistent icons across the interface.  

### Authentication System
- **Google OAuth 2.0** → Handles user authentication, eliminating password management complexity.  
- Authentication flow runs in a popup window, so users never leave the main site.  

---

## Advantages of This Architecture
- **Maintainability**  
  - Clean component separation makes bugs easy to isolate and features simple to add.  
  - Established patterns serve as templates for future development.  

- **Scalability**  
  - Independent design supports growth without major architectural changes.  
  - Easy to add new pages, features, and functionality using the same proven patterns.  

- **Team Collaboration**  
  - Clear component boundaries allow team members to work independently.  
  - Shared tools and patterns ensure smooth integration and alignment.  
