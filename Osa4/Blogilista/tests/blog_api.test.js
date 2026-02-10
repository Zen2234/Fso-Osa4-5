const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  { title: 'Blog 1', author: 'Author 1', url: 'http://example.com/1', likes: 3 },
  { title: 'Blog 2', author: 'Author 2', url: 'http://example.com/2', likes: 5 },
]

beforeEach(async () => {
  await Blog.deleteMany({})

  for (const blog of initialBlogs) {
    const blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('blogs are returned as JSON', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.status, 200)
  assert.ok(response.headers['content-type'].includes('application/json'))
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('returned blogs have field id instead of _id', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach(blog => {
    assert.ok(blog.id)
    assert.strictEqual(blog._id, undefined)
  })
})

test('a valid blog can be added', async () => {
  const responseBefore = await api.get('/api/blogs')
  const initialLength = responseBefore.body.length

  const newBlog = {
    title: 'New Blog',
    author: 'Test Author',
    url: 'http://example.com/new',
    likes: 10,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const responseAfter = await api.get('/api/blogs')
  const blogs = responseAfter.body

  assert.strictEqual(blogs.length, initialLength + 1)

  const titles = blogs.map(b => b.title)
  assert.ok(titles.includes('New Blog'))
})

test('a blog can be deleted', async () => {
  const responseBefore = await api.get('/api/blogs')
  const blogToDelete = responseBefore.body[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const responseAfter = await api.get('/api/blogs')

  assert.strictEqual(
    responseAfter.body.length,
    responseBefore.body.length - 1
  )

  const titles = responseAfter.body.map(b => b.title)
  assert.ok(!titles.includes(blogToDelete.title))
})

after(async () => {
  await mongoose.connection.close()
})