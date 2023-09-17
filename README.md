## About

This project is created to identify and keep track of a customer's identity across multiple purchases.

### Tech Stack
- Typescript
- Express.js (Node.js)
- Postgres
- typeorm

### Database Structure
It has `Contact` table with following columns
```
    {
    id                   Int                   
    phoneNumber          String?
    email                String?
    linkedId             Int? // the ID of another Contact linked to this one
    linkPrecedence       "secondary"|"primary" // "primary" if it's the first Contact in the link
    createdAt            DateTime              
    updatedAt            DateTime              
    deletedAt            DateTime?
    }
```

### API Reference
#### `POST \api\contacts\identify` 
```   
 body: {
    "email": <any valid email string | null>,
    "phoneNumber": <any string | null>
}
    
response: {
    "contact":{
        "primaryContatctId": 11,
        "emails": ["george@hillvalley.edu","biffsucks@hillvalley.edu"]
        "phoneNumbers": ["919191","717171"]
        "secondaryContactIds": [27]
    }
}
```
### Available Scripts

#### `npm run dev`

Run the server in development mode.

#### `npm run lint`

Check for linting errors.

#### `npm run build`

Build the project for production.

#### `npm start`

Run the production build (Must be built first).

#### `npm start -- --env="name of env file" (default is production).`

Run production build with a different env file.


### Additional Notes

- Running project in developement require .env file, which is not not public. 
