import React, { useState, useCallback, useMemo } from 'react';
import Card from './components/Card/Card';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Card component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong with the card component.</h2>
          <p>Please refresh the page to try again.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // Initial card data
  const initialCards = [
    {
      id: 'react-dev',
      title: 'React Development',
      initialLiked: true
    },
    {
      id: 'js-fundamentals',
      title: 'JavaScript Fundamentals',
      initialLiked: false
    },
    {
      id: 'css-animations',
      title: 'CSS Animations',
      initialLiked: true
    },
    {
      id: 'web-design',
      title: 'Web Design Principles',
      initialLiked: false
    }
  ];

  // State management
  const [cards, setCards] = useState(initialCards);
  const [likedCards, setLikedCards] = useState(new Set());
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  // Initialize liked cards from localStorage
  React.useEffect(() => {
    const likedSet = new Set();
    cards.forEach(card => {
      const savedState = localStorage.getItem(`card-${card.id}-liked`);
      if (savedState === 'true' || (savedState === null && card.initialLiked)) {
        likedSet.add(card.id);
      }
    });
    setLikedCards(likedSet);
  }, [cards]);

  // Handle like state changes
  const handleLikeChange = useCallback((cardId, isLiked) => {
    setLikedCards(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.add(cardId);
      } else {
        newSet.delete(cardId);
      }
      return newSet;
    });
  }, []);

  // Handle card deletion
  const handleCardDelete = useCallback((cardId) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
    setLikedCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(cardId);
      return newSet;
    });
  }, []);

  // Handle adding new card
  const handleAddCard = useCallback(() => {
    if (newCardTitle.trim()) {
      const newCard = {
        id: `card-${Date.now()}`,
        title: newCardTitle.trim(),
        initialLiked: false
      };
      
      setCards(prev => [...prev, newCard]);
      setNewCardTitle('');
      setIsAddingCard(false);
      
      console.log('New card added:', newCard);
    }
  }, [newCardTitle]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    handleAddCard();
  }, [handleAddCard]);

  // Memoized calculations
  const likeCount = useMemo(() => likedCards.size, [likedCards]);
  const totalCards = useMemo(() => cards.length, [cards]);

  // Keyboard navigation for add card form
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsAddingCard(false);
      setNewCardTitle('');
    }
  }, []);

  return (
    <div className="app">
      <ErrorBoundary>
        <header className="app-header">
          <h1 className="app-title">React Mini Card Project</h1>
          <p className="app-description">
            Interactive card system with like/unlike functionality, local storage persistence, 
            and smooth animations. Each card maintains its own state independently.
          </p>
          
          {/* Statistics */}
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">{totalCards}</span>
              <span className="stat-label">Total Cards</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{likeCount}</span>
              <span className="stat-label">Liked Cards</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{totalCards - likeCount}</span>
              <span className="stat-label">Not Liked</span>
            </div>
          </div>

          {/* Add new card section */}
          <div className="add-card-section">
            {!isAddingCard ? (
              <button 
                className="add-card-button"
                onClick={() => setIsAddingCard(true)}
                aria-label="Add new card"
              >
                <span className="add-icon">+</span>
                Add New Card
              </button>
            ) : (
              <form className="add-card-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter card title..."
                    className="card-title-input"
                    maxLength={50}
                    autoFocus
                    aria-label="New card title"
                  />
                  <div className="form-buttons">
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={!newCardTitle.trim()}
                      aria-label="Create card"
                    >
                      Create
                    </button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => {
                        setIsAddingCard(false);
                        setNewCardTitle('');
                      }}
                      aria-label="Cancel adding card"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </header>

        <main className="main-content">
          {cards.length === 0 ? (
            <div className="empty-state">
              <h2>No cards yet</h2>
              <p>Add your first card to get started!</p>
            </div>
          ) : (
            <div className="cards-grid">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  title={card.title}
                  initialLiked={card.initialLiked}
                  cardId={card.id}
                  onLikeChange={handleLikeChange}
                  onDelete={handleCardDelete}
                />
              ))}
            </div>
          )}
        </main>

        <footer className="app-footer">
          <p>
            Built with React, Vite, and CSS Modules. 
            Features include state persistence, animations, and accessibility support.
          </p>
        </footer>
      </ErrorBoundary>
    </div>
  );
}

export default App;
