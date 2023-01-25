# Backend routes

<br/>
You may notice that there is no get route that gets all entries and instead Patch is used. I specifically used patch because I wanted a different route that meant
something different when a coder looked at it. All patch routes get table data that is paginated this reduces the size of each request. Previously in the old system 
when a get request was made it would just get all of the data in the table which took up to 15 seconds.
<br/>
<br/>
There are two types of patch queries:
1. Query One Table
2. Query a Joined Table (ie. all project made by one customer)
<br/>
<br/>
When you run a Patch query you send data you send the table column name and the query data you want and it queries it for you and it put it in the special table component.
<br/>

<br/>
<br/>

## Activities

| Router                           | Method | Table | Details                          |
| -------------------------------- | ------ | ----- | -------------------------------- |
| /activities?customer=customer_id | GET    |       | get all of customer x activities |
| /activities?contact=contact_id   | GET    |       | get all of contact x activities  |
| /activities?quote=quote_id       | GET    |       | get all quote x activities       |
| /activities                      | PATCH  | TABLE | get all activities paginated     |
| /activities                      | POST   |       | create activity                  |
| /activities/:id                  | GET    |       | get one activity                 |
| /activities/:id                  | PUT    |       | edit one activity                |
| /activities/:id                  | DELETE |       | delete one activity              |

## Contacts

| Router                         | Method | Table | Details                                  |
| ------------------------------ | ------ | ----- | ---------------------------------------- |
| /contacts?customer=customer_id | GET    |       | get all contacts from specified customer |
| /contacts                      | PATCH  | TABLE | get all contacts paginated               |
| /contacts                      | POST   |       | create contact                           |
| /contacts/:id                  | GET    |       | get one contact                          |
| /contacts/:id                  | PUT    |       | edit one contact                         |
| /contacts/:id                  | DELETE |       | delete one contact                       |
| /contacts/:id/project          | PATCH  | TABLE | get projects from that contact paginated |
| /contacts/:id/quotes           | PATCH  | TABLE | get quotes from that contact paginated   |
| /contacts/:id/project          | PATCH  | TABLE | get projects from that contact paginated |

<br />      
<br />

## Customer

| Router                | Method | Table | Details                                   |
| --------------------- | ------ | ----- | ----------------------------------------- |
| /customer?type=active | GET    |       | get all ACTIVE customers                  |
| /customer             | PATCH  | TABLE | get all customers paginated               |
| /customer             | POST   |       | create customer                           |
| /customer/:id         | GET    |       | get one customer                          |
| /customer/:id         | PUT    |       | edit one customer                         |
| /customer/:id         | DELETE |       | delete one customer                       |
| /customer/:id/project | PATCH  | TABLE | get projects by that customer paginated   |
| /customer/:id/quotes  | PATCH  | TABLE | get quotes by that customer paginated --> |

<br />      
<br />

## Customer Types

| Router          | Method | Table | Details                       |
| --------------- | ------ | ----- | ----------------------------- |
| /customer_types | GET    |       | get all ACTIVE customer types |

<br />      
<br />

## Industries

| Router      | Method | Table | Details            |
| ----------- | ------ | ----- | ------------------ |
| /industries | GET    |       | get all industries |

<br />      
<br />

## Notes

| Router                      | Method | Table | Details                     |
| --------------------------- | ------ | ----- | --------------------------- |
| /notes?customer=customer_id | GET    |       | get all of customer x notes |
| /notes?contact=contact_id   | GET    |       | get all of contact x notes  |
| /notes?quote=quote_id       | GET    |       | get all quote x notes       |
| /notes                      | PATCH  | TABLE | get all notes paginated     |
| /notes                      | POST   |       | create note                 |
| /notes/:id                  | GET    |       | get one note                |
| /notes/:id                  | PUT    |       | edit one note               |
| /notes/:id                  | DELETE |       | delete one note             |

<br />      
<br />

## Quotes

| Router        | Method | Table | Details                    |
| ------------- | ------ | ----- | -------------------------- |
| /projects     | PATCH  | TABLE | get all projects paginated |
| /projects     | POST   |       | create project             |
| /projects/:id | GET    |       | get one project            |
| /projects/:id | PUT    |       | edit one project           |
| /projects/:id | DELETE |       | delete one project         |

<br />      
<br />

## Quotes Customers

| Router                           | Method | Table | Details                              |
| -------------------------------- | ------ | ----- | ------------------------------------ |
| /quotes/:id/quotes_contacts      | GET    |       | get all contacts from specific quote |
| /quotes/:id/quotes_contacts      | POST   |       | create quote                         |
| /quotes/:id/quotes_contacts/:id2 | GET    |       | get one quote                        |
| /quotes/:id/quotes_contacts/:id2 | PUT    |       | edit one quote                       |
| /quotes/:id/quotes_contacts/:id2 | DELETE |       | delete one quote                     |

<br />      
<br />

## Quotes Notes

| Router                        | Method | Table | Details               |
| ----------------------------- | ------ | ----- | --------------------- |
| /quotes/:id/quotes_notes      | GET    |       | get all quote notes   |
| /quotes/:id/quotes_notes      | POST   |       | create quote note     |
| /quotes/:id/quotes_notes/:id2 | PUT    |       | edit one quote note   |
| /quotes/:id/quotes_notes/:id2 | DELETE |       | delete one quote note |

<br />      
<br />

## Quotes Permissions

| Router              | Method | Table | Details                         |
| ------------------- | ------ | ----- | ------------------------------- |
| /quotes_permissions | Get    |       | get all quote permissionses > 0 |

<br />      
<br />

## Quotes Status

| Router                     | Method | Table | Details                |
| -------------------------- | ------ | ----- | ---------------------- |
| /quotes_status?type=active | Get    |       | get all quote statuses |

<br />      
<br />

## Sales Type

| Router                  | Method | Table | Details             |
| ----------------------- | ------ | ----- | ------------------- |
| /sales_type?type=active | GET    |       | get all sales types |

<br />      
<br />

## Users

| Router                   | Method | Table | Details                                   |
| ------------------------ | ------ | ----- | ----------------------------------------- |
| /users?type=active       | GET    |       | get all active users (full_name, user_id) |
| /users?type=engineers    | G ET   |       | get all engineers (full_name, user_id)    |
| /users?type=estimators   | GET    |       | get all estimators (full_name, user_id)   |
| /users?type=shop_users   | GET    |       | get all office users (full_name, user_id) |
| /users?type=office_users | GET    |       | get all shop users (full_name, user_id)   |
| /users                   | PATCH  | TABLE | get all users paginated                   |
| /users                   | POST   |       | create user                               |
| /users/:id               | GET    |       | get one user                              |
| /users/:id               | PUT    |       | edit one user                             |
| /users/:id               | DELETE |       | delete one user                           |

<br />      
<br />

## Users Permissions

| Router                 | Method | Table | Details                   |
| ---------------------- | ------ | ----- | ------------------------- |
| /users_permissions/:id | GET    |       | get one users permissions |

<!--

## Backend routes
### Users, Coffees, Favourites, Reviews
___

## Users
- /api/users/:user_id - GET - Show details of a user
- /api/users/:user_id - PATCH - Update a user (STRETCH)
- /api/users/:user_id - DELETE - Delete a user (STRETCH)
- /api/users - GET - Show details of multiple users (STRETCH)
- /api/users - POST - Create a user
- /api/users/login - POST - Login
- /api/users/register - POST - Register
- /api/users/authenticate - POST - Authenticate
<br>
 > Notes on authenticate: authenticate users on first load of app with cookie. If user cookie exists, log them in automatically. If cookie doesn't exist or is invalid, act as if user is not logged in. This is needed because with react, if we refresh the page then we lose the state of current user.

<br>

<br>

# Frontend routes (views)
The react components that conditionally render are responsible for making axios requests to fetch data from the api.

- / - Home Page
- /login - Login Page
- /register - Register Page
- /account - User Account Page
- /coffees - Filter Coffees Page
- /coffees/:id - Coffee/Product Page
- /add-coffee - Add A New Coffee Page -->
