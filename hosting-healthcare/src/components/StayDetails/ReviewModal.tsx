import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import './StayDetails.css';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => void;
  hostName: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, hostName }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a star rating");
      return;
    }
    if (!reviewText.trim()) {
      alert("Please write a review");
      return;
    }
    
    onSubmit(rating, reviewText);
    // Reset form
    setRating(0);
    setReviewText('');
    onClose();
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="review-modal-header">
          <h2>Review Property!</h2>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="review-modal-body">
          <p className="review-description">
            Let others know about your stay experience with Host <strong>"{hostName}"</strong>. 
            Your feedback helps them grow and improve their service!
          </p>

          {/* Star Rating */}
          <div className="star-rating-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="star-btn"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  size={32} 
                  fill={(hoverRating || rating) >= star ? "#FFA500" : "white"} 
                  color={(hoverRating || rating) >= star ? "#FFA500" : "#ccc"} 
                  strokeWidth={2}
                />
              </button>
            ))}
          </div>

          {/* Text Area */}
          <div className="review-input-group">
            <label>Leave a Review</label>
            <textarea
              className="review-textarea"
              placeholder="Share your experience.."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="review-modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-submit-btn" onClick={handleSubmit}>Submit</button>
        </div>

      </div>
    </div>
  );
};

export default ReviewModal;