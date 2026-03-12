import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const API_URL = 'http://localhost:8080/api'

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null)
  const [view, setView] = useState('dashboard') // dashboard, books, members, issues

  // Data State
  const [stats, setStats] = useState({ totalBooks: 0, totalMembers: 0, activeIssues: 0 })
  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const [issuedBooks, setIssuedBooks] = useState([])

  // Utility for authenticated fetches
  const authFetch = async (url, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, { ...options, headers })
    if (res.status === 401) {
      handleLogout()
      throw new Error("Unauthorized")
    }
    return res
  }

  // App initialization
  useEffect(() => {
    fetch(`${API_URL}/init`).catch(() => console.log("Backend not running?"))
  }, [])

  useEffect(() => {
    if (token) {
      if (view === 'dashboard') fetchStats()
      if (view === 'books') fetchBooks()
      if (view === 'members') fetchMembers()
      if (view === 'issues') fetchIssued()
    }
  }, [view, token])

  const fetchStats = () => authFetch(`${API_URL}/stats`).then(r => r.json()).then(setStats).catch(console.error)
  const fetchBooks = () => authFetch(`${API_URL}/books`).then(r => r.json()).then(setBooks).catch(console.error)
  const fetchMembers = () => authFetch(`${API_URL}/members`).then(r => r.json()).then(setMembers).catch(console.error)
  const fetchIssued = () => authFetch(`${API_URL}/transactions/issued`).then(r => r.json()).then(setIssuedBooks).catch(console.error)

  const handleLogin = async (e) => {
    e.preventDefault()
    const raw = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: e.target.username.value
      })
    })
    const res = await raw.json()
    if (res.success && res.token) {
      setToken(res.token)
      localStorage.setItem('adminToken', res.token)
    } else {
      alert("Invalid login credentials")
    }
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('adminToken')
    setView('dashboard')
  }

  const handleAddBook = async (e) => {
    e.preventDefault()
    const book = {
      title: e.target.title.value,
      author: e.target.author.value,
      totalCopies: parseInt(e.target.copies.value)
    }
    await authFetch(`${API_URL}/books`, {
      method: 'POST',
      body: JSON.stringify(book)
    })
    e.target.reset()
    fetchBooks()
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    const member = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value
    }
    await authFetch(`${API_URL}/members`, {
      method: 'POST',
      body: JSON.stringify(member)
    })
    e.target.reset()
    fetchMembers()
  }

  const handleIssueBook = async (e) => {
    e.preventDefault()
    const payload = {
      bookId: parseInt(e.target.bookId.value),
      memberId: parseInt(e.target.memberId.value)
    }
    const res = await authFetch(`${API_URL}/transactions/issue`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (res.ok) alert("Book Issued successfully")
    else alert(data.message)
    e.target.reset()
    fetchIssued()
  }

  const handleReturnBook = async (id) => {
    const res = await authFetch(`${API_URL}/transactions/return/${id}`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) alert(`Returned! Fine: $${data.fine}`)
    else alert(data.message)
    fetchIssued()
  }

  if (!token) {
    return (
      <div className="auth-container">
        <div className="card">
          <h2>Welcome</h2>
          <form onSubmit={handleLogin}>
            <input name="username" placeholder="Enter your Username" required />
            <button type="submit">Enter Dashboard</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="main-container">
      <h1>Library Management System</h1>
      <div className="nav-buttons">
        <button onClick={() => setView('dashboard')}>Dashboard</button>
        <button onClick={() => setView('books')}>Manage Books</button>
        <button onClick={() => setView('members')}>Manage Members</button>
        <button onClick={() => setView('issues')}>Issue & Return</button>
        <button className="btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      {view === 'dashboard' && (
        <div className="dashboard-card">
          <h2>Library Analytics Overview</h2>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', justifyContent: 'center' }}>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}><h3>Total Books</h3><h1 style={{ margin: 0, color: '#a6e3a1' }}>{stats.totalBooks}</h1></div>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}><h3>Total Members</h3><h1 style={{ margin: 0, color: '#89b4fa' }}>{stats.totalMembers}</h1></div>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}><h3>Active Issues</h3><h1 style={{ margin: 0, color: '#f38ba8' }}>{stats.activeIssues}</h1></div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={[
                { name: 'Books', count: stats.totalBooks, fill: '#a6e3a1' },
                { name: 'Members', count: stats.totalMembers, fill: '#89b4fa' },
                { name: 'Active Issues', count: stats.activeIssues, fill: '#f38ba8' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#45475a" />
                <XAxis dataKey="name" stroke="#cdd6f4" />
                <YAxis stroke="#cdd6f4" />
                <Tooltip contentStyle={{ backgroundColor: '#181825', borderColor: '#45475a' }} />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {view === 'books' && (
        <div className="dashboard-card">
          <h2>Add New Book</h2>
          <form onSubmit={handleAddBook} className="form-grid">
            <input name="title" placeholder="Book Title" required />
            <input name="author" placeholder="Author" required />
            <input name="copies" type="number" placeholder="Total Copies" required min="1" />
            <button type="submit">Add Book</button>
          </form>

          <h2>Book Catalog</h2>
          <table>
            <thead>
              <tr><th>ID</th><th>Title</th><th>Author</th><th>Total Copies</th><th>Available</th></tr>
            </thead>
            <tbody>
              {books.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.totalCopies}</td>
                  <td>{b.availableCopies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'members' && (
        <div className="dashboard-card">
          <h2>Register Member</h2>
          <form onSubmit={handleAddMember} className="form-grid">
            <input name="name" placeholder="Full Name" required />
            <input name="email" type="email" placeholder="Email Address" required />
            <input name="phone" placeholder="Phone Number" required />
            <button type="submit">Add Member</button>
          </form>

          <h2>Registered Members</h2>
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td>{m.id}</td><td>{m.name}</td><td>{m.email}</td><td>{m.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'issues' && (
        <div className="dashboard-card">
          <h2>Issue Book</h2>
          <form onSubmit={handleIssueBook} className="form-grid">
            <input name="bookId" type="number" placeholder="Book ID" required />
            <input name="memberId" type="number" placeholder="Member ID" required />
            <button type="submit">Issue Book</button>
          </form>

          <h2>Currently Issued Books</h2>
          <table>
            <thead><tr><th>Transaction ID</th><th>Book</th><th>Member</th><th>Issue Date</th><th>Due Date</th><th>Action</th></tr></thead>
            <tbody>
              {issuedBooks.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.book?.title}</td>
                  <td>{t.member?.name}</td>
                  <td>{t.issueDate}</td>
                  <td>{t.dueDate}</td>
                  <td><button className="btn-success" onClick={() => handleReturnBook(t.id)}>Return</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default App
