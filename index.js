const express = require('express')
const port = 7000
const app = express()
const { graphqlHTTP } = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = require('graphql')

//sample data 
const authors = [
    {id:1, name: "John"},
    {id:2, name: "bond"},
    {id:3, name: "james"}
]

var books = [
    { id: 1, name: "sql interview book", authorId: 1 },
    { id: 2, name: "java interview book", authorId: 2 },
    { id: 3, name: "php interview book", authorId: 2 },
    { id: 4, name: "mysql interview book", authorId: 3 },
    { id: 5, name: "mongodb interview book", authorId: 1 },
    { id: 6, name: "graphql interview book", authorId: 2 },
    { id: 7, name: "c++ interview book", authorId: 2},
    { id: 8, name: "python interview book", authorId: 3 },
]

const bookTypes = new GraphQLObjectType({
    name: "bookTypes",
    description: "About the books",
    fields: () =>({
        id: {type:GraphQLInt},
        name: {type:GraphQLString},
        authorId: {type:GraphQLInt},
        authorName: {
            type: GraphQLString,
            description: "name of the author",
            resolve: (book) =>{
                let author = authors.find(a => a.id ===book.authorId);
                return author.name
            }
        }
    })
})

const authorTypes = new GraphQLObjectType({
    name: "authorTypes",
    description: "author the books",
    fields: () =>({
        id: {type:GraphQLInt},
        name: {type:GraphQLString},
        books:{
            type: GraphQLList(bookTypes),
            description: "Books by author",
            resolve: (author) =>{
                return books.filter(b => b.authorId == author.id)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: "Root_Query",
    description: "new graph ql schema",
    fields: () =>({
        test: {
            type: GraphQLString,
            description: "test field",
            resolve: () =>{
                return "Hello graphql"
            }
        },
        books: {
            type: GraphQLList(bookTypes),
            description: "Lists of books",
            resolve: () =>{
                return books
            }
        },
        authors: {
            type: GraphQLList(authorTypes),
            description: "Authors of books",
            resolve: () =>{
                return authors
            }
        }
    })
})

const MutationType = new GraphQLObjectType({
    name: "MutationType",
    description: "here we do mutation operation",
    fields: () =>({
        addBook: {
            type: bookTypes,
            description: "add book here",
            args:{
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) =>{
                let newBook = { id: books.length+1, name: args.name, authorId: args.authorId}
                books.push(newBook)
                return newBook
            }
        },
        updateBook: {
            type: bookTypes,
            description: "update book id",
            args:{
                name: {type: GraphQLNonNull(GraphQLString)},
                id: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) =>{
                let book = books.find(b => b.id == args.id)
                book.name = args.name
                return book
            }
        },
        removeBook: {
            type: GraphQLList(bookTypes),
            description: "remove book by id",
            args:{
                id: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) =>{
                let book = books.filter(b => b.id != args.id)
                books = book
                return books
            }
        }
    })
})

const schema  = new GraphQLSchema({
    query: RootQueryType,
    mutation: MutationType
})
app.use("/graphql", graphqlHTTP({
    schema: schema,
    graphiql: true
}))

app.listen(port, ()=>{
    console.log(`Yup! server is running on port ${port}`)
})