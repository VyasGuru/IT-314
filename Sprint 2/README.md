# Sprint 2: Building Our Database Foundation

In this sprint we were focused on building a functioning database for our real estate listing website so that we can integrate it with our backend to bring the project up and running.
---

## The Decision of the type of Databse to use SQL or NoSQL

The first step was to compare **SQL** (structured, relational databases) with **NoSQL** (non-relational, flexible databases).

### SQL (Considered PostgreSQL)
We first experimented with PostgreSQL. It is a structured database system where every column must be predefined.  
This approach works well for applications with deterministic data.

### NoSQL (Considered MongoDB)
We then explored MongoDB a NoSQL database that provides flexibility in how data is stored.  
Its main advantage is that it does not require a fixed schema. Each document can have different attributes.

After testing both options, our group decided to go with **MongoDB**.  
For our project the data can vary depending on the type of property. MongoDB’s flexible schema made it a more practical choice for this use case.

---

## Our Implementation Process

After making the decision, we began implementing MongoDB using **JavaScript**.  
The process involved several steps:

### 1. Initial Connection Test
We first created a simple JavaScript script to connect to our local MongoDB server located at port 27017.  
Once we received a “connection successful” message, we confirmed that our setup was working correctly.

### 2. Designing the Schema
Even though MongoDB allows flexibility, we wanted to maintain consistency in our data.  
Therefore, we defined a schema within our JavaScript code to ensure that important fields such as `price`, `location`, and `lister` are always included in every property document.

### 3. Creating and Populating Collections
With the schema ready, we created the main collections — such as **Users** and **Properties** — and inserted test data to verify that data storage and retrieval were functioning as expected.

---

## Tools Used in This Sprint

To complete the implementation, we worked with the following tools:

- **mongosh**: The MongoDB shell used for running quick commands and inserting sample documents.
- **MongoDB Compass**: A graphical interface that allowed us to visualize collections, inspect documents, and verify that data was stored correctly.

---

## Sprint 2 Summary

By the end of Sprint 2 we set up our database, connected it to our development environment, and verified that it could store and manage data as intended.  


