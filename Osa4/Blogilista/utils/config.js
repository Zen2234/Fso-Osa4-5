require('dotenv').config()

const PORT = process.env.PORT || 3003

const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI || 'mongodb+srv://mokomuru:<password>@cluster0.in0dxw7.mongodb.net/bloglist?retryWrites=true&w=majority'

const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`


module.exports = { MONGODB_URI, PORT, BASE_URL }
