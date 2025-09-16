# ELICITATION TECHNIQUES

## Visitor
**Techniques:**
- **Task Observation / Ethnography:**  
  Observe how first-time visitors interact with existing real estate sites to identify pain points.  
  **Justification:** Direct observation reveals hidden usability issues (e.g., difficulty finding property info), helping design a smoother, user-friendly interface.

- **Questionnaires:**  
  Collect feedback from potential visitors about what information they expect without logging in.  
  **Justification:** Since visitors don’t directly interact with developers, surveys offer a simple and scalable way to capture their expectations (e.g., property details, location visibility) without needing detailed interviews.

---

## 2.1 Lister / Seller / Owner / Real Estate Agent

**Techniques:**
- **Questionnaires:**  
  Collect structured input from potential listers about their needs, preferred workflows, and feature expectations.  
  **Justification:** Listers are the primary content creators for the platform. Questionnaires provide quick, scalable feedback from multiple listers without needing one-to-one interviews, helping capture key pain points efficiently.

- **Prototyping (Lightweight Wireframes):**  
  Provide listers with early mock-ups of “Add Property” forms, “My Listings” dashboard, and other features.  
  **Justification:** Even if requirements seem clear, listers may imagine workflows differently. Prototyping helps clarify UI/UX and prevents misinterpretation of requirements (e.g., discovering the need for a “Save as Draft” option).

- **Analysis of Existing Systems / Documentation:**  
  Study established real estate platforms (e.g., MagicBricks, 99acres, Zillow) and their guidelines/terms.  
  **Justification:** Ensures your system includes essential features (like marking a property as sold/rented) and stays realistic by aligning with industry standards and best practices.

- Study existing platforms (MagicBricks, 99acres, Zillow, Housing.com).  
- Analyze their features (filters, reviews, premium listings, map integration).  
- Read terms & conditions, listing guidelines → this is “documentation analysis.”  
- Include real estate regulations (e.g., RERA in India) as part of “legal documents.”

- **Use Cases & Scenarios:**  
  Model lister actions such as adding a property, updating details, deactivating listings, and responding to buyers.  
  **Justification:** Helps identify hidden requirements like error handling, rejected uploads, or expired documents, reducing ambiguity in requirements documentation.

---

## 2.2 Buyer / Renter

**Techniques:**
- **Questionnaires / Surveys:**  
  Collect preferences from a wide range of buyers/renters about filters (budget, location, property type, reviews).  
  **Justification:** Buyers/renters form the largest and most diverse user group. Surveys provide broad, quantifiable data (e.g., what percentage care most about locality vs. cost) efficiently.

- **Interviews:**  
  Conduct one-on-one or small-group discussions to understand in-depth expectations and pain points (e.g., difficulty contacting listers, comparing properties).  
  **Justification:** While surveys give breadth, interviews provide depth. Some users may have niche requirements (e.g., school ratings, neighborhood safety) that only surface in conversation.

- **Prototyping:**  
  Allow buyers/renters to interact with early versions of property search, comparison, and request features.  
  **Justification:** Usability is critical. Prototyping ensures search and filter features are intuitive, helping avoid confusion and guiding UI/UX design before full development.

- **Use Cases & Scenarios:**  
  Model typical journeys such as “Buyer searches with filters,” “Buyer compares two properties,” or “Buyer requests a visit.”  
  **Justification:** By modeling real-life flows (e.g., “Buyer saves property → receives notification if price drops”), developers get clear, testable requirements aligned with user expectations.

---

## 3. Admin

**Techniques:**
- **Questionnaires:**  
  Collect large-scale data on filtering preferences, budget ranges, and decision-making criteria.  
  **Justification:** Helps admins understand user trends and priorities, enabling informed decisions for platform policies and feature design.

- **Discourse Analysis (forums, reviews of existing apps):**  
  Analyze recurring themes in user complaints (e.g., fake listings, poor filters).  
  **Justification:** Identifies common issues faced by users, allowing the admin team to prioritize fixes and improve system reliability.

- **Prototyping:**  
  Validate how users search, filter, and compare properties.  
  **Justification:** Ensures that admin interfaces and workflows support efficient monitoring, reporting, and decision-making before full-scale development.

- **Use Cases & Scenarios:**  
  Model actions like verifying property proofs, approving listers, handling user complaints, and monitoring suspicious activity.  
  **Justification:** Clearly defines admin responsibilities and edge cases (e.g., what happens if a property proof is invalid), reducing ambiguity in requirements.

- **Brainstorming:**  
  Encourage internal discussion among admins (and with legal/developers when needed) to generate strategies for fraud prevention and policy enforcement.  
  **Justification:** Allows the admin team to collaboratively consider fraud scenarios and dispute handling strategies. Combined perspectives create stronger fraud detection policies and smoother coordination with Legal and Developers.

- **Risk Analysis:**  
  Identify potential threats like fraudulent listings, fake listers, or data misuse.  
  **Justification:** Critical because admins directly handle compliance and fraud issues. Risk analysis ensures preventive measures are designed into the system, improving security and reliability.

---

## 3.1 Legal Team

**Techniques:**
- **Analysis of Existing Systems / Documentation:**  
  Review property registration laws, land records, compliance policies, and real estate regulations.  
  **Justification:** The legal framework is already established. The team refers to existing laws and policies (e.g., RERA guidelines, government APIs for land records) rather than creating new rules.

- **Questionnaires / Interviews:**  
  Clarify from legal experts what documents are mandatory for property proof, acceptable formats, and legal limitations.  
  **Justification:** Efficiently collects structured input from busy legal professionals, ensuring the system captures all legal requirements without wasting time.

- **Use Cases & Scenarios:**  
  Define system behavior in different legal situations, such as incomplete proof submission, fraudulent registration IDs, or disputes.  
  **Justification:** Translates legal requirements into actionable system behavior. For example, if a property registration ID fails verification, the system flags it for admin review instead of approving it automatically.

---

## 3.2 Government / Regulatory Body

**Techniques:**
- **Automated verification through APIs:**  
  System checks property ID against government database → reduces manual work.

- **Analysis of Existing Systems / Documentation:**  
  Study property registration processes, land records, RERA guidelines, and available public APIs.  
  **Justification:** Government procedures and compliance laws are well-documented. The system must adapt to them, not reinvent them.

- **Interviews / Questionnaires:**  
  Collect structured requirements from government officials or compliance experts (e.g., mandatory data fields for property verification).  
  **Justification:** Ensures the system aligns with legal and regulatory requirements.

- **Use Cases & Scenarios:**  
  Define interactions with government databases, including verifying registration IDs, handling invalid entries, or API unavailability.  
  **Justification:** Bridges the gap between legal processes and technical implementation (e.g., marking flagged listings as pending verification and notifying admins).

---

## 3.3 Customer Support Team

**Techniques:**
- **Task Observation:**  
  Observe how they handle user complaints in existing setups.  
  **Justification:** Reveals real-world challenges (e.g., resolution time, escalations) to design better support workflows.

- **Discourse Analysis:**  
  Analyze chat logs, emails, and call records to identify recurring problems.  
  **Justification:** Guides system improvements by highlighting common issues, such as difficulty contacting listers or password reset problems.

- **Brainstorming:**  
  Discuss solutions to improve dispute resolution workflows and FAQs.  
  **Justification:** Leverages practical insights from support staff to optimize user assistance and potentially introduce automation (e.g., chatbots).

- **Use Cases & Scenarios:**  
  Model responses to situations like fake listing complaints, refund requests, or communication breakdowns.  
  **Justification:** Defines structured escalation paths to avoid confusion and ensure consistent support.

---

## 3.4 Data Security & Compliance Team

**Techniques:**
- **Risk Analysis:**  
  Identify possible security threats (data breaches, fraud, unauthorized access).  
  **Justification:** Essential to anticipate vulnerabilities and design preventive measures to protect user data and sensitive property proofs.

- **Analysis of Existing Systems / Documentation:**  
  Review cybersecurity standards (e.g., GDPR, ISO standards, Indian IT Act).  
  **Justification:** Ensures compliance with established legal frameworks and industry best practices.

- **Interviews / Questionnaires:**  
  Gather expert opinions on security requirements and best practices.  
  **Justification:** Translates abstract laws into actionable technical requirements (e.g., encrypting proofs at rest, masking user contact info).

- **Use Cases & Scenarios:**  
  Define system responses to security events (e.g., unauthorized login, failed encryption, expired sessions).  
  **Justification:** Makes defense mechanisms explicit, testable, and ready for practical implementation.

---

## 3.5 Developers / IT Support

**Techniques:**
- **Brainstorming:**  
  Generate ideas for features, performance optimization, and technical solutions.  
  **Justification:** Encourages technical creativity to solve challenges like efficient filtering, session management, and API integration.

- **Prototyping:**  
  Build and test mock-ups of forms, dashboards, and admin panels.  
  **Justification:** Enables early feedback, usability testing, and reduced development errors.

- **Joint Application Design (JAD):**  
  Collaborative workshops with admins, listers, legal, and support staff.  
  **Justification:** Ensures development aligns with all stakeholder needs and technical feasibility.

- **Use Cases & Scenarios:**  
  Define workflows such as “User saves listing → Database stores → User retrieves later.”  
  **Justification:** Clarifies expected system behavior, avoids miscommunication, and establishes testable requirements.
