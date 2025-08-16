import React from 'react';
import CampaignApp from './CampaignApp';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 text-white">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mb-8">📊 Central de Atendimento</h1>
        <CampaignApp />
      </div>
    </div>
  );
}

export default App;
