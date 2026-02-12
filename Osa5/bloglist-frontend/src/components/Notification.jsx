const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  const style = {
    border: 'solid 1px',
    padding: 10,
    marginBottom: 10,
  }

  return (
    <div style={style}>
      {message}
    </div>
  )
}

export default Notification