import React from 'react';
import '../styles/BackgroundGrid.scss';

const bgImages = [
  '/bg/1.jpg',
  '/bg/2.jpg',
  '/bg/3.jpg',
  '/bg/4.jpg',
  '/bg/5.jpg',
  '/bg/6.jpg',
  '/bg/7.jpg',
  '/bg/8.jpg',
  '/bg/9.jpg',
  '/bg/10.jpg',
  '/bg/12.jpg',
  '/bg/11.jpg',
];

const BackgroundGrid: React.FC = () => {
  return (
    <div className="background-grid">
      {bgImages.map((src, index) => (
        <div className="bg-image-container" key={`bg-${index}`}>
          <img
            src={src}
            alt=""
            className="bg-image"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};

export default BackgroundGrid;
