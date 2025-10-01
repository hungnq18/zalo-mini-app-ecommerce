import React, { useContext, useEffect } from 'react';
import AppContext from '../context/AppContext';
import '../css/suggestedUtilities.scss';

const SuggestedUtilities = () => {
  const appContext = useContext(AppContext);
  
  // Check if context is available
  if (!appContext) {
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

  const { state, actions } = appContext;

  // Load utilities if not available
  useEffect(() => {
    if (state.utilities.length === 0) {
      actions.loadUtilities();
    }
  }, [actions, state.utilities.length]);

  // Show loading state if utilities are loading
  if (state.loading.utilities || state.utilities.length === 0) {
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

  return (
    <div className="suggested-utilities-section">
      <div className="suggested-utilities-header">
        <h2 className="suggested-utilities-title">Tiện ích đề xuất</h2>
      </div>
      
      <div className="suggested-utilities-grid">
        {state.utilities.slice(0, 4).map((utility) => (
          <div key={utility.id} className="suggested-utilities-card">
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
};

export default SuggestedUtilities;
