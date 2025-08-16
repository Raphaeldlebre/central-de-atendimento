import React, { useState } from 'react';

function CampaignApp() {
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: "Campanha de Boas-Vindas", status: "Ativa" },
    { id: 2, name: "Promoção Especial", status: "Agendada" }
  ]);

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 text-gray-900">
      <h2 className="text-2xl font-semibold mb-4">📢 Campanhas</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">Nome</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map(c => (
            <tr key={c.id} className="hover:bg-gray-100">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CampaignApp;
