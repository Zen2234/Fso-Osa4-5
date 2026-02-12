import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  const blog = {
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://testurl.com',
    likes: 5,
    user: {
      name: 'Test User',
      username: 'testuser'
    }
  }

  let handleLike

  beforeEach(() => {
    handleLike = vi.fn()
  })

  test('renders title and author by default, shows url, likes and user after clicking view', async () => {
    const user = userEvent.setup()
    render(<Blog blog={blog} handleLike={handleLike} user={blog.user} />)

    expect(screen.getByText(/Test Blog/i)).toBeInTheDocument()
    expect(screen.getByText(/Test Author/i)).toBeInTheDocument()
    expect(screen.queryByText('http://testurl.com')).not.toBeInTheDocument()
    expect(screen.queryByText('likes 5')).not.toBeInTheDocument()
    expect(screen.queryByText('Test User')).not.toBeInTheDocument()

    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    expect(screen.getByText('http://testurl.com')).toBeInTheDocument()
    expect(screen.getByText('likes 5')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()

    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    expect(handleLike).toHaveBeenCalledTimes(1)
    expect(handleLike).toHaveBeenCalledWith(blog)
  })

  test('calls event handler twice when like button is clicked twice', async () => {
    const user = userEvent.setup()
    render(<Blog blog={blog} handleLike={handleLike} user={blog.user} />)

    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(handleLike).toHaveBeenCalledTimes(2)
  })
})