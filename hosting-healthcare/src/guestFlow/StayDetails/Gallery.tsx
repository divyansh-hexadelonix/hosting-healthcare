import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { propertiesData } from '../../data/propertiesData';
import './Gallery.css';

const Gallery: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { propertyId } = location.state || {};

  // Find the property data
  const property = propertiesData.find(p => p.id === propertyId);

  useEffect(() => {
    window.scrollTo(0, 0);
    // If accessed directly without an ID, redirect to home/browse
    if (!propertyId || !property) {
      navigate('/browseStays'); 
    }
  }, [propertyId, property, navigate]);

  if (!property) return null;

  // Mock array of extra images.
  const galleryImages = [
    property.image,
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=400&fit=crop",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&h=400&fit=crop",
  ];

  return (
    <div className="gallery-container">
      <header className="gallery-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={28} />
        </button>
        <h1 className="gallery-title">Images Gallery</h1>
      </header>

      <div className="gallery-grid">
        {galleryImages.map((img, index) => (
          <div key={index} className={`gallery-item item-${index % 6}`}>
            <img src={img} alt={`Gallery view ${index + 1}`} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;