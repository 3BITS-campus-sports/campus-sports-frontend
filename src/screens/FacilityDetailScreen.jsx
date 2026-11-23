import React from 'react';
import {
  iconBackBlue,
  iconMapTeal,
  iconClockTeal,
  iconTagOrange,
  iconCheckGreen,
  iconPhoneWhite,
  iconInfoDark,
  iconArrowDark
} from '../constants/figmaAssets';
import { formatAmount } from '../constants/dateTimeHelpers';

export default function FacilityDetailScreen({
  selectedFacility,
  onBack,
  onChooseDateTime,
  onOpenHelp,
  currency
}) {
  if (!selectedFacility) return null;

  const priceParts = (facility) => {
    const ron = `${formatAmount(facility.priceRon)} RON`;
    const eur = `${formatAmount(facility.priceEur)} EUR`;
    return currency === 'RON' ? [ron, eur] : [eur, ron];
  };

  return (
    <div className="sc-stack">
      <button type="button" className="sc-back-link" onClick={onBack}>
        <img src={iconBackBlue} alt="" />
        Toate facilitățile
      </button>

      <section className="sc-panel">
        <h3 className="sc-panel-title">Informații utile</h3>
        <div className="sc-info-row">
          <span className="sc-info-badge"><img src={iconMapTeal} alt="" /></span>
          <span className="sc-info-text">
            <span>Locație</span>
            <strong>{selectedFacility.usefulInfo.location}</strong>
          </span>
        </div>
        <div className="sc-info-row">
          <span className="sc-info-badge"><img src={iconClockTeal} alt="" /></span>
          <span className="sc-info-text">
            <span>Program</span>
            <strong>{selectedFacility.usefulInfo.program}</strong>
          </span>
        </div>
        <hr className="sc-separator" />
        <div className="sc-price-line">
          <span>{selectedFacility.slotMinutes || 60} min / rezervare</span>
          <span className="sc-price">
            <strong className="sc-price-large">{priceParts(selectedFacility)[0]}</strong>
            <span>/ {priceParts(selectedFacility)[1]}</span>
          </span>
        </div>
        <p className="sc-muted-note">Preț de bază pentru un interval; reducerea se aplică la plată.</p>
      </section>

      <div className="sc-promo-box">
        <img src={iconTagOrange} alt="" />
        <span>{selectedFacility.usefulInfo.notice}</span>
      </div>

      <section className="sc-panel sc-panel-tight">
        <h3 className="sc-panel-title">Înainte de vizită</h3>
        {selectedFacility.usefulInfo.beforeVisit.map((rule) => (
          <div key={rule} className="sc-rule">
            <span className="sc-rule-badge"><img src={iconCheckGreen} alt="" /></span>
            <span>{rule}</span>
          </div>
        ))}
      </section>

      <section className="sc-panel sc-panel-tight">
        <h3 className="sc-panel-title">{selectedFacility.usefulInfo.equipmentTitle || 'Echipament'} (opțional)</h3>
        {selectedFacility.usefulInfo.equipmentOptions.map((item, index) => (
          <React.Fragment key={item.name}>
            {index > 0 && <hr className="sc-separator" />}
            <div className="sc-equipment-row">
              <span>{item.name}</span>
              <strong>{formatAmount(item.price)} RON</strong>
            </div>
          </React.Fragment>
        ))}
      </section>

      <section className="sc-contact-box">
        <div className="sc-contact-row">
          <span className="sc-phone-badge"><img src={iconPhoneWhite} alt="" /></span>
          <span>
            Pentru mai multe detalii, sunați la {selectedFacility.contactPhone || 'recepția bazei sportive'}
          </span>
        </div>
        <button type="button" className="sc-btn-secondary" onClick={onOpenHelp}>
          Ajutor
          <img src={iconInfoDark} alt="" className="sc-btn-icon" />
        </button>
      </section>

      <button type="button" className="sc-btn-primary" onClick={onChooseDateTime}>
        Rezervă · alege data și ora
        <img src={iconArrowDark} alt="" />
      </button>
      <p className="sc-muted-note sc-center">Vei vedea disponibilitatea înainte de plată.</p>
    </div>
  );
}
