import { useState, useEffect, useRef } from 'react'
import blogService from './services/blogs'
import loginService from './services/login'
import Blog from './components/Blog'
import LoginForm from './components/Loginform'
import BlogForm from './components/Blogform'
import Notification from './components/Notification'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)

  const blogFormRef = useRef()

  const showNotification = (message, seconds = 5) => {
    setNotification(message)
    setTimeout(() => setNotification(null), seconds * 1000)
  }

  const createBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      blogFormRef.current.toggleVisibility()
      showNotification(`A new blog "${returnedBlog.title}" by ${returnedBlog.author} added`)
    } catch (error) {
      console.error(error)
      showNotification('Error creating blog')
    }
  }

  const handleLike = async (blog) => {
    try {
      const updatedBlog = {
        user: blog.user?._id || blog.user?.id,
        likes: blog.likes + 1,
        author: blog.author,
        title: blog.title,
        url: blog.url
      }

      const blogId = blog.id || blog._id

      const returnedBlog = await blogService.update(blogId, updatedBlog)

      setBlogs(blogs.map(b =>
        (b.id || b._id) === blogId ? returnedBlog : b
      ))
    } catch (error) {
      showNotification('error updating likes')
      console.error(error)
    }
  }

  const handleDelete = async (blog) => {
    if (!blog) {
      showNotification('Blog missing, cannot delete')
      return
    }

  const blogId = blog._id || blog.id
    if (!blogId) {
      showNotification('Blog id missing, cannot delete')
      return
    }

    if (window.confirm(`Delete "${blog.title}" by ${blog.author}?`)) {
      try {
        console.log('Blog ID sent to backend:', blogId)
        await blogService.remove(blogId)
        setBlogs(blogs.filter(b => (b._id || b.id) !== blogId))
        showNotification(`Deleted blog "${blog.title}"`)
      } catch (error) {
        console.error(error)
        showNotification('Error deleting blog')
      }
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      showNotification(`${user.name} logged in successfully`)
    } catch (error) {
      console.error(error)
      showNotification('Wrong username or password')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    setUser(null)
    showNotification('Logged out successfully')
  }

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs.sort((a, b) => b.likes - a.likes))
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={notification} />
        <LoginForm
          handleLogin={handleLogin}
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
        />
      </div>
    )
  }

  return (
    <div>
      <h2>Blogs</h2>
      <Notification message={notification} />

      <p>
        {user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </p>

      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={createBlog} />
      </Togglable>

    {blogs
      .sort((a, b) => b.likes - a.likes)
      .map(blog => (
        <Blog
        key={blog.id}
        blog={blog}
        handleLike={handleLike}
        handleDelete={handleDelete}
        user={user}
      />
    ))}
    </div>
  )
}

export default App
