import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Card.module.css';

/**
 * Reusable Card component with like/unlike functionality
 * @param {string} title - The title to display on the card (required)
 * @param {boolean} initialLiked - Initial like state (default: false)
 * @param {string} cardId - Unique identifier for the card
 * @param {function} onLikeChange - Callback function called when like state changes
 * @param {function} onDelete - Callback function called when card is deleted
 */
const Card = React.memo(({ 
  title, 
  initialLiked = false, 
  cardId, 
  onLikeChange,
  onDelete 
}) => {
  // Initialize like state from localStorage if available, otherwise use initialLiked
  const [isLiked, setIsLiked] = useState(() => {
    if (cardId) {
      const savedState = localStorage.getItem(`card-${cardId}-liked`);
      return savedState !== null ? JSON.parse(savedState) : initialLiked;
    }
    return initialLiked;
  });

  // Memoized toggle function for better performance
  const toggleLike = useCallback(() => {
    setIsLiked(prevLiked => {
      const newLikedState = !prevLiked;
      
      // Save to localStorage if cardId is provided
      if (cardId) {
        localStorage.setItem(`card-${cardId}-liked`, JSON.stringify(newLikedState));
      }
      
      // Call parent callback if provided
      if (onLikeChange) {
        onLikeChange(cardId, newLikedState);
      }
      
      // Console logging for development
      console.log(`Card "${title}" like state changed to: ${newLikedState}`);
      
      return newLikedState;
    });
  }, [cardId, onLikeChange, title]);

  // Handle card deletion with confirmation
  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete the card "${title}"?`)) {
      // Remove from localStorage
      if (cardId) {
        localStorage.removeItem(`card-${cardId}-liked`);
      }
      
      // Call parent callback
      if (onDelete) {
        onDelete(cardId);
      }
      
      console.log(`Card "${title}" deleted`);
    }
  }, [cardId, onDelete, title]);

  // Handle keyboard navigation for accessibility
  const handleKeyPress = useCallback((event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  return (
    <div className={`${styles.card} ${isLiked ? styles.liked : ''}`}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>{title}</h3>
        {onDelete && (
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            onKeyPress={(e) => handleKeyPress(e, handleDelete)}
            aria-label={`Delete ${title} card`}
            title="Delete card"
          >
            ×
          </button>
        )}
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.statusContainer}>
          <span className={`${styles.statusLabel} ${isLiked ? styles.likedLabel : styles.notLikedLabel}`}>
            {isLiked ? 'Liked' : 'Not Liked'}
          </span>
        </div>
        
        <button
          className={`${styles.likeButton} ${isLiked ? styles.likeButtonActive : ''}`}
          onClick={toggleLike}
          onKeyPress={(e) => handleKeyPress(e, toggleLike)}
          aria-label={`${isLiked ? 'Unlike' : 'Like'} ${title}`}
          title={`${isLiked ? 'Unlike' : 'Like'} this card`}
        >
          <span className={`${styles.heartIcon} ${isLiked ? styles.heartIconLiked : ''}`}>
            ❤️
          </span>
          <span className={styles.buttonText}>
            {isLiked ? 'Unlike' : 'Like'}
          </span>
        </button>
      </div>
    </div>
  );
});

// Display name for React DevTools
Card.displayName = 'Card';

// PropTypes validation
Card.propTypes = {
  /** The title to display on the card */
  title: PropTypes.string.isRequired,
  
  /** Initial like state of the card */
  initialLiked: PropTypes.bool,
  
  /** Unique identifier for the card */
  cardId: PropTypes.string,
  
  /** Callback function called when like state changes */
  onLikeChange: PropTypes.func,
  
  /** Callback function called when card is deleted */
  onDelete: PropTypes.func
};

// Default props
Card.defaultProps = {
  initialLiked: false,
  cardId: null,
  onLikeChange: null,
  onDelete: null
};

export default Card;