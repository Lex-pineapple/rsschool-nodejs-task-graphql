## Assignment: Graphql

### To start testing:

1. Install dependencies: npm ci
2. Create .env file (rename .env.example): ./.env
3. Create empty db file: ./prisma/database.db
4. Apply pending migrations: npx prisma migrate deploy
5. Seed db: npx prisma db seed
6. Run the tests **below**

### Tests:

1. GraphQL queries
   [x] `npm run test-queries` +144
2. GraphQL mutations
   [x] `npm run test-mutations` +90
3. Limited GraphQL queries length (max length **5**)
   [x] `npm run test-rule` +18
4. Solved `n+1` QraphQL problem with **dataloader** package
   [x] `npm run test-loader` +80
   [x] `npm run test-loader-prime` +28

### Implemented GaphQL Queries

1. **Users**
   **Query:**

```
users {
   id
   name
   balance
   profile {}
   posts {}
   userSubscribedTo {
      id
      name
      balance
   }
   subscribedToUser {
      id
      name
      balance
   }
}
```

**Variables:**

`userId: UUID!`

2. **Posts**
   **Query:**

```
posts {
   id
   title
   content
}
```

**Variables:**
`$postId: UUID!`

3. **Profiles**
   **Query:**

```
profiles {
   id
   isMale
   yearOfBirth
   memberTypes {}
}
```

**Variables:**
`$profileId: UUID!`

4. **MemberTypes**
   **Query:**

```
memberTypes {
   id
   discount
   postsLimitPerMonth
}
```

**Variables:**
`$memberTypeId: MemberTypeId!`

### Implemented GraphQL mutations

**Create:**

```
mutation ($postDto: CreatePostInput!, $userDto: CreateUserInput!, $profileDto: CreateProfileInput!) {
   createPost(dto: $postDto) {
      id
   }
   createUser(dto: $userDto) {
      id
   }
   createProfile(dto: $profileDto) {
      id
   }
}
```

**Update:**

```
mutation ($postId: UUID!, $postDto: ChangePostInput!, $profileId: UUID!, $profileDto: ChangeProfileInput!, $userId: UUID!, $userDto: ChangeUserInput!) {
   changePost(id: $postId, dto: $postDto) {
      id
   }
   changeProfile(id: $profileId, dto: $profileDto) {
      id
   }
   changeUser(id: $userId, dto: $userDto) {
      id
   }
}
```

**Delete:**

```
mutation ($userId: UUID!, $profileId: UUID!, $postId: UUID!) {
   deletePost(id: $postId)
   deleteProfile(id: $profileId)
   deleteUser(id: $userId)
}
```

**Subscribe/unsubscribe**

```
mutation ($userId1: UUID!, $authorId1: UUID!, $userId2: UUID!, $authorId2: UUID!) {
   subscribeTo(userId: $userId1, authorId: $authorId1) {
      id
   }
   unsubscribeFrom(userId: $userId2, authorId: $authorId2)
}
```
