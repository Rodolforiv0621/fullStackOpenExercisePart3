const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
const Person = require('./models/note')

// app.use(morgan('tiny'))


morgan.token('body', (request) => JSON.stringify(request.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(people => {
    response.json(people)
  }).catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  const time = new Date()
  Person.countDocuments({}).then(data => {
    response.send(
      `<p>Phonebook has info for ${data} people<br/><br/>${time}</p>`
    )
  }).catch(error => next(error))

})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id).then(person => {
    response.json(person)
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id).then(() => {
    response.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const data = request.body
  console.log(data)
  if(!data.name){
    return response.status(400).json({
      error: 'name is missing'
    })
  }else if(!data.number){
    return response.status(400).json({
      error: 'number is missing'
    })
  }

  //Check if name is unique
  Person.findOne({ name: data.name }).then(person => {
    if(person){
      console.log(`${data.name} was found: `, person)
      return response.status(400).json({
        error: 'name must be unique'
      })
    }else{
      // const id = Math.floor(Math.random() * 100000);
      // data.id = String(id)
      // notes = notes.concat(data)
      const person = Person({
        name: data.name,
        number: data.number
      })

      person.save().then(savedPerson => {
        response.json(savedPerson)
      })
    }
  }).catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndUpdate(id, { number: request.body.number }, { new: true }).then(data => {
    response.json(data)
  }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.log(error)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}
app.use(errorHandler)
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})