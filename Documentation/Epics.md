# Epics
<table>
<thead>
<tr>
<th >Epic ID</th>
<th >Epic Name</th>
<th >Description</th>
</tr>
</thead>
<tbody>

<tr>
<td><strong>Epic 1</strong></td>
<td><strong>Property Discovery and Information Access</strong></td>
<td>Groups user stories related to browsing, searching, filtering, and viewing property information by all user types. Includes basic browsing capabilities for visitors, location-based searches, price filtering, property comparison features, and detailed property information display.</td>
</tr>

<tr>
<td><strong>Epic 2</strong></td>
<td><strong>Property Listing and Information Management</strong></td>
<td>Encompasses all functionality for verified listers to create, update, hide, and manage their property information listings. Includes document verification processes, listing approval workflows, and property status management without any payment handling.</td>
</tr>

<tr>
<td><strong>Epic 3</strong></td>
<td><strong>User Registration and Verification</strong></td>
<td>Covers user registration, authentication, profile management, and identity verification processes for both property seekers and listers. Includes secure login functionality and document verification for building platform credibility.</td>
</tr>

<tr>
<td><strong>Epic 4</strong></td>
<td><strong>Communication and Connection Facilitation</strong></td>
<td>E Encompasses functionality to facilitate direct communication between property seekers and listers through contact sharing.</td>
</tr>

<tr>
<td><strong>Epic 5</strong></td>
<td><strong>Administrative Oversight and Content Management</strong></td>
<td>Includes admin functionalities such as user verification, listing moderation, fraud detection, and platform analytics. Covers content quality control and policy enforcement.</td>
</tr>

<tr>
<td><strong>Epic 6</strong></td>
<td><strong>System Security and Data Protection</strong></td>
<td>Covers security features like audit logging, data protection, and privacy compliance. Includes backup systems and monitoring capabilities focused on information security.
</td>
</tr>

</tbody>
</table>

***

## Epic Priority Matrix

| Priority Level | Epic | Justification |
| :-- | :-- | :-- |
| **Critical** | Epic 1, Epic 3 | Core functionality for user access and property browsing |
| **High** | Epic 2, Epic 4 | Essential for property management and user communication |
| **Medium** | Epic 5, Epic 6 | Important for platform quality and security |


***
## Cross-Epic Dependencies

| Epic | Depends On | Reason |
| :-- | :-- | :-- |
| Epic 2 | Epic 3 | Users must be registered to create listings |
| Epic 4 | Epic 1, Epic 3 | Users must exist and properties must be viewable |
| Epic 5 | Epic 2, Epic 3 | Admin needs users and listings to manage |
| Epic 6 | All Epics | Security applies across all functionality |



