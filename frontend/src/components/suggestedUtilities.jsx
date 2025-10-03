import React, { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../css/suggestedUtilities.scss';

const SuggestedUtilities = memo(({ shouldLoad = true }) => {
  const { state, actions } = useApp();
  const navigate = useNavigate();

  // Load utilities if not available and shouldLoad is true
  useEffect(() => {
    console.log('SuggestedUtilities useEffect - state.utilities:', state.utilities, 'shouldLoad:', shouldLoad);
    if (shouldLoad && (!state.utilities || state.utilities.length === 0)) {
      console.log('Loading utilities...');
      actions.loadUtilities();
    }
  }, [actions, state.utilities, shouldLoad]);

  // Show loading state if utilities are loading
  if (state.loading.utilities) {
    return (
      <div className="suggested-utilities-section">
        <div className="suggested-utilities-header">
          <h2 className="suggested-utilities-title">Tiện ích đề xuất</h2>
        </div>
        
        <div className="suggested-utilities-loading">
          <div className="suggested-utilities-grid">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="suggested-utilities-card">
                <div className="suggested-utilities-icon skeleton"></div>
                <div className="suggested-utilities-content">
                  <div className="suggested-utilities-item-title skeleton"></div>
                  <div className="suggested-utilities-item-subtitle skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't show section if no utilities
  if (!state.utilities || state.utilities.length === 0) {
    console.log('No utilities to display');
    return null;
  }

  console.log('Rendering utilities:', state.utilities);

  return (
    <div className="suggested-utilities-section">
      <div className="suggested-utilities-header">
        <h2 className="suggested-utilities-title">Tiện ích đề xuất</h2>
      </div>
      
      <div className="suggested-utilities-grid">
        {state.utilities.slice(0, 4).map((utility) => (
          <div 
            key={utility.id} 
            className="suggested-utilities-card" 
            onClick={() => {
              if (utility.path) {
                navigate(utility.path);
              }
            }}
          >
            <div className={`suggested-utilities-icon ${utility.color}`}>
              <span className={`suggested-utilities-icon-text ${utility.iconColor}`}>
                {utility.icon}
              </span>
            </div>
            <div className="suggested-utilities-content">
              <div className="suggested-utilities-item-title">
                {utility.title}
              </div>
              <div className="suggested-utilities-item-subtitle">
                {utility.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

SuggestedUtilities.displayName = 'SuggestedUtilities';

export default SuggestedUtilities;
