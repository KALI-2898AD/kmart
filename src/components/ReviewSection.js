"use client";

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        const data = await res.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
      } catch (err) {
         console.error("Failed to load reviews");
      }
    };
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment })
      });
      const data = await res.json();
      
      if (res.ok) {
        setReviews([data.review, ...reviews]);
        setComment('');
        setRating(5);
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '4rem', width: '100%' }}>
      <h2 className="brand-font" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Customer Reviews</h2>
      
      {/* Review Form */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
         <h3 style={{ marginBottom: '1rem' }}>Write a Review</h3>
         {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
         <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Rating</label>
               <select 
                 value={rating} 
                 onChange={(e) => setRating(Number(e.target.value))}
                 style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
               >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Terrible</option>
               </select>
            </div>
            <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Comment</label>
               <textarea 
                 value={comment}
                 onChange={(e) => setComment(e.target.value)}
                 rows="4"
                 required
                 style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem', resize: 'vertical' }}
                 placeholder="Share your thoughts..."
               ></textarea>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
               <span>{loading ? 'Submitting...' : 'Submit Review'}</span>
            </button>
         </form>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
         {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first to review this item!</p>
         ) : (
            reviews.map(review => (
               <div key={review._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                     <strong style={{ color: 'white' }}>{review.userId?.name || 'Anonymous'}</strong>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                     </span>
                  </div>
                  <div style={{ display: 'flex', color: '#fbbf24', marginBottom: '1rem' }}>
                     {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} color={i < review.rating ? 'currentColor' : 'var(--text-secondary)'} />
                     ))}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                     {review.comment}
                  </p>
               </div>
            ))
         )}
      </div>
    </div>
  );
}
