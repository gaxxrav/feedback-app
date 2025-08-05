
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import BoardList from './BoardList';
import CreateBoard from './components/CreateBoard';
import BoardDetail from './components/BoardDetail';
import EditBoard from './components/EditBoard';
import FeedbackList from './components/FeedbackList';
import CreateFeedback from './components/CreateFeedback';
import FeedbackDetail from './components/FeedbackDetail';
import EditFeedback from './components/EditFeedback';
import KanbanBoard from './components/KanbanBoard';
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
              
              {/* Feedback Routes */}
              <Route path="/feedback" element={<FeedbackList />} />
              <Route path="/feedback/create" element={<CreateFeedback />} />
              <Route path="/feedback/:id" element={<FeedbackDetail />} />
              <Route path="/feedback/:id/edit" element={<EditFeedback />} />
              <Route path="/board/:boardId/feedback" element={<FeedbackList />} />
              <Route path="/board/:boardId/feedback/create" element={<CreateFeedback />} />
              
              {/* Kanban Board Route */}
              <Route path="/kanban" element={<KanbanBoard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
