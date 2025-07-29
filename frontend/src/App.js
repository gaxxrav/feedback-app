
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BoardList from './BoardList';
import CreateBoard from './components/CreateBoard';
import BoardDetail from './components/BoardDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          <Routes>
            <Route path="/" element={<BoardList />} />
            <Route path="/create-board" element={<CreateBoard />} />
            <Route path="/board/:id" element={<BoardDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
