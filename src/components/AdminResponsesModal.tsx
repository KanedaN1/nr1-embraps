import React, { useState } from 'react';
import { X, Trash2, Eye, ShieldAlert } from 'lucide-react';
import type { QuestionnaireResponse } from '../types';

interface AdminResponsesModalProps {
  isOpen: boolean;
  onClose: () => void;
  responses: QuestionnaireResponse[];
  onDeleteResponse?: (id: string) => void;
}

export const AdminResponsesModal: React.FC<AdminResponsesModalProps> = ({ 
  isOpen, 
  onClose, 
  responses,
  onDeleteResponse
}) => {
  const [viewingResponse, setViewingResponse] = useState<QuestionnaireResponse | null>(null);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 34, 68, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem'
    }} onClick={onClose}>
      
      <div 
        className="card animate-fade-in" 
        style={{
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '20px',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          background: 'linear-gradient(135deg, #002244 0%, #003B70 100%)',
          color: '#FFFFFF',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <ShieldAlert size={24} color="#10B981" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Gestão de Questionários (Modo Admin)</h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#FFFFFF',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, backgroundColor: '#F8FAFC' }}>
          
          {viewingResponse ? (
            <div>
              <button 
                onClick={() => setViewingResponse(null)}
                className="btn btn-outline"
                style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Voltar para a lista
              </button>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#002244', marginBottom: '1rem' }}>
                Respostas Individuais - {viewingResponse.workplaceName} / {viewingResponse.jobPositionName}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {Object.entries(viewingResponse.dimensionScores).map(([dimId, score]) => (
                  <div key={dimId} style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Dimensão: {dimId}</span>
                    <span style={{ fontWeight: 800, color: '#0066CC' }}>{score as number}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Abaixo estão todos os {responses.length} questionários respondidos na base de dados.
              </p>
              
              {responses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                  Nenhum questionário encontrado na base de dados.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                        <th style={{ padding: '0.75rem', color: '#002244', fontWeight: 700 }}>Data/Hora</th>
                        <th style={{ padding: '0.75rem', color: '#002244', fontWeight: 700 }}>Posto</th>
                        <th style={{ padding: '0.75rem', color: '#002244', fontWeight: 700 }}>Cargo</th>
                        <th style={{ padding: '0.75rem', color: '#002244', fontWeight: 700, textAlign: 'center' }}>Média</th>
                        <th style={{ padding: '0.75rem', color: '#002244', fontWeight: 700, textAlign: 'center' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((resp, idx) => (
                        <tr key={resp.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                          <td style={{ padding: '0.75rem', color: '#475569' }}>
                            {new Date(resp.timestamp).toLocaleString('pt-BR')}
                          </td>
                          <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0F172A' }}>{resp.workplaceName}</td>
                          <td style={{ padding: '0.75rem', color: '#334155' }}>{resp.jobPositionName}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 700, color: '#0066CC' }}>{resp.totalAverage}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button 
                              onClick={() => setViewingResponse(resp)}
                              style={{ padding: '0.4rem', border: 'none', backgroundColor: '#EBF5FF', color: '#0066CC', borderRadius: '6px', cursor: 'pointer' }}
                              title="Ver detalhes"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Tem certeza que deseja excluir este questionário permanentemente?')) {
                                  onDeleteResponse?.(resp.id);
                                }
                              }}
                              style={{ padding: '0.4rem', border: 'none', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: '6px', cursor: 'pointer' }}
                              title="Excluir questionário"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
