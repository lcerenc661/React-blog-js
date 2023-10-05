import Header from './Header'
import Nav from './Nav'
import Footer from './Footer'

import Home from './Home'
import NewPost from './NewPost'
import PostPage from './PostPage'
import EditPost from './EditPost'
import About from './About'
import Missing from './Missing'

import { Route, Routes, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import api from './api/post'

function App () {
  const [posts, setPosts] = useState([])
  const [postTitle, setPostTitle] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [editBody, setEditBody] = useState('')
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const navigate = useNavigate()
  const handleNavigate = url => {
    navigate(url)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1
    const datetime = format(new Date(), 'MMMM dd, yyyy pp')
    const newPost = { id, title: postTitle, datetime, body: postBody }
    try {
      const response = await api.post('/posts', newPost)
      const allPost = [...posts, response.data]
      setPosts(allPost)
      setPostTitle('')
      setPostBody('')
      handleNavigate('/')
    } catch (err) {
      console.log(`Error: ${err.message}`)
    }
  }

  const handleEdit = async (id) => {
    const datetime = format(new Date(), 'MMMM dd, yyyy pp')
    const editedPost = { id, title: editTitle, datetime, body: editBody }
    try {
      const response = await api.put(`/posts/${id}`, editedPost)
      setPosts(
        posts.map(post => (post.id === id ? { ...response.data } : post))
      )
      setEditBody('')
      setEditTitle('')
      handleNavigate('/')
    } catch (err) {
      console.log(`Error: ${err.message}`)
    }
  }

  const handleDelete = async id => {
    try {
      await api.delete(`/posts/${id}`)
      const postList = posts.filter(post => post.id !== id)
      setPosts(postList)
      handleNavigate('/')
    } catch (err) {
      console.log(`Error: ${err.message}`)
    }
  }

  useEffect(() => {
    const filteredResults = posts.filter(
      post =>
        post.body.toLowerCase().includes(search.toLowerCase()) ||
        post.title.toLowerCase().includes(search.toLowerCase())
    )
    setSearchResults(filteredResults.reverse())
  }, [posts, search])

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get('/posts')

        if (response && response.data) {
          setPosts(response.data)
          console.log(response.data)
        }
      } catch (err) {
        if (err.response) {
          // Not in the 200 response range
          console.log(err.response.data)
          console.log(err.response.status)
          console.log(err.response.headers)
        } else {
          console.log(`Error: ${err.message}`)
        }
      }
    }
    fetchPost()
  }, [])

  return (
    <div className='App'>
      <Header title='React Js Blog' />
      <Nav search={search} setSearch={setSearch} />

      <Routes>
        <Route exact path='/' element={<Home posts={searchResults} />} />
        <Route
          path='post'
          element={
            <NewPost
              handleSubmit={handleSubmit}
              postTitle={postTitle}
              setPostTitle={setPostTitle}
              postBody={postBody}
              setPostBody={setPostBody}
            />
          }
        />
        <Route
          path='edit/:id'
          element={
            <EditPost
              posts={posts}
              handleEdit={handleEdit}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              editBody={editBody}
              setEditBody={setEditBody}
            />
          }
        />
        <Route
          path='/post/:id'
          element={<PostPage posts={posts} handleDelete={handleDelete} />}
        />
        <Route exact path='/about' element={<About />} />
        <Route path='*' element={<Missing />} />
      </Routes>

      <Footer />
    </div>
  )
}

export default App
