
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import BoardList from './BoardList';
import CreateBoard from './components/CreateBoard';
import BoardDetail from './components/BoardDetail';
import EditBoard from './components/EditBoard';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/boards" element={<BoardList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create-board" element={<CreateBoard />} />
              <Route path="/board/:id" element={<BoardDetail />} />
              <Route path="/board/:id/edit" element={<EditBoard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
