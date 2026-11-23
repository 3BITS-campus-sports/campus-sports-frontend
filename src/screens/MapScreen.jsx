import React from 'react';
import { campusPins } from '../constants/mockData';
import { formatAmount } from '../constants/dateTimeHelpers';

export default function MapScreen({
  facilitiesList,
  selectedPinId,
  setSelectedPinId,
  mapFilter,
  setMapFilter,
  onOpenFacilityDetails
}) {
  const filteredFacilities = facilitiesList.filter((f) =>
    mapFilter === 'Toate' ? true : f.category === mapFilter
  );

  const activePin = campusPins.find((p) => p.facilityId === selectedPinId) || campusPins[0];
  const matchedFacility = facilitiesList.find((f) => f.id === selectedPinId) || facilitiesList[0];

  return (
    <div>
      {/* Filtre Categorie Hartă */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '8px' }}>
        {['Toate', 'Sporturi', 'Înot', 'Relaxare'].map((cat) => (
          <button
            key={cat}
            onClick={() => setMapFilter(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid var(--border-light)',
              background: mapFilter === cat ? '#0B1F3A' : 'var(--card-bg)',
              color: mapFilter === cat ? '#C6F246' : 'var(--text-main)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Harta Interactivă SVG USV Campus */}
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid var(--border-light)',
        marginBottom: '14px',
        boxShadow: '0 4px 14px rgba(11, 31, 58, 0.08)'
      }}>
        <div style={{
          padding: '8px 12px',
          background: 'var(--bg-page)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)' }}>
            📍 Campus USV Suceava (Str. Universității nr. 13)
          </span>
          <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: 800 }}>
            ● 4 baze sportive active
          </span>
        </div>

        <div style={{ position: 'relative', width: '100%', height: '240px', background: '#F1F5F9' }}>
          <svg viewBox="0 0 400 240" style={{ width: '100%', height: '100%', display: 'block' }}>
            {/* Fundal alei și iarbă */}
            <rect x="0" y="0" width="400" height="240" fill="#E2E8F0" />
            <rect x="230" y="20" width="150" height="90" fill="#DCFCE7" rx="8" />
            <rect x="240" y="120" width="140" height="90" fill="#FEF3C7" rx="8" />

            {/* Drumuri / Alei pietonale campus */}
            <path d="M 0 110 L 400 110" stroke="#CBD5E1" strokeWidth="18" fill="none" />
            <path d="M 130 0 L 130 240" stroke="#CBD5E1" strokeWidth="16" fill="none" />
            <path d="M 230 40 L 230 220" stroke="#CBD5E1" strokeWidth="12" fill="none" />

            {/* Corp A / Rectorat */}
            <rect x="20" y="20" width="90" height="60" fill="#94A3B8" rx="6" />
            <text x="65" y="48" fill="white" fontSize="9" fontWeight="800" textAnchor="middle">Corp A (Rectorat)</text>
            <text x="65" y="62" fill="#E2E8F0" fontSize="8" textAnchor="middle">Str. Universității</text>

            {/* Corp C / FIESC */}
            <rect x="20" y="130" width="90" height="70" fill="#64748B" rx="6" />
            <text x="65" y="162" fill="white" fontSize="9" fontWeight="800" textAnchor="middle">Corp C (FIESC)</text>
            <text x="65" y="176" fill="#E2E8F0" fontSize="8" textAnchor="middle">Laboratoare IT</text>

            {/* Corp E - Complex Sportiv */}
            <rect x="150" y="40" width="65" height="140" fill="#3B82F6" rx="8" opacity="0.85" />
            <text x="182" y="105" fill="white" fontSize="9" fontWeight="900" textAnchor="middle" transform="rotate(-90 182 105)">Corp E Sportiv</text>

            {/* Teren Fotbal Sintetic */}
            <rect x="245" y="30" width="120" height="65" fill="#15803D" rx="6" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="305" y="65" fill="white" fontSize="9" fontWeight="800" textAnchor="middle">⚽ Teren Sintetic</text>

            {/* Teren Tenis */}
            <rect x="260" y="135" width="105" height="65" fill="#C2410C" rx="6" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="312" y="170" fill="white" fontSize="9" fontWeight="800" textAnchor="middle">🎾 Teren Tenis</text>

            {/* Pin-uri interactive pentru facilitati */}
            {campusPins.map((pin) => {
              const isSelected = selectedPinId === pin.facilityId;
              return (
                <g
                  key={pin.id}
                  onClick={() => setSelectedPinId(pin.facilityId)}
                  style={{ cursor: 'pointer' }}
                >
                  {isSelected && (
                    <circle cx={pin.x} cy={pin.y} r="18" fill={pin.color} opacity="0.3">
                      <animate attributeName="r" values="14;22;14" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={pin.x} cy={pin.y} r="12" fill={isSelected ? '#0B1F3A' : pin.color} stroke="#FFFFFF" strokeWidth="2" />
                  <text x={pin.x} y={pin.y + 4} fill={isSelected ? '#C6F246' : 'white'} fontSize="11" fontWeight="800" textAnchor="middle">
                    {pin.icon}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Indicator Facilitate Selectata pe Harta */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            right: '8px',
            background: 'rgba(11, 31, 58, 0.92)',
            backdropFilter: 'blur(4px)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <strong style={{ fontSize: '12px', color: '#C6F246', display: 'block' }}>
                {activePin.name}
              </strong>
              <span style={{ fontSize: '10px', color: '#CBD5E1' }}>
                {activePin.zone}
              </span>
            </div>
            {matchedFacility && (
              <button
                className="btn-figma-green"
                style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '6px' }}
                onClick={() => onOpenFacilityDetails(matchedFacility)}
              >
                Rezervă aici
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista Facilităților din Campus */}
      <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 10px' }}>
        Baze sportive în campus ({filteredFacilities.length})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {filteredFacilities.map((facility) => (
          <div
            key={facility.id}
            className="info-section-box"
            style={{
              margin: 0,
              cursor: 'pointer',
              border: selectedPinId === facility.id ? '2px solid #0B1F3A' : '1px solid var(--border-light)',
              transition: 'all 0.15s ease'
            }}
            onClick={() => setSelectedPinId(facility.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>
                {facility.category} · {facility.subtitle}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>
                {formatAmount(facility.priceRon)} RON <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-secondary)' }}>/ slot</span>
              </span>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 6px' }}>
              {facility.name}
            </h4>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
                ● {facility.hours || 'Deschis azi'}
              </span>
              <button
                className="btn-figma-dark"
                style={{ padding: '6px 12px', fontSize: '11px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFacilityDetails(facility);
                }}
              >
                Vezi program și rezervă
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
