import React from 'react';
import {
  iconSearch,
  iconMapWhite,
  decorCard,
  iconTag,
  dotOpen,
  iconArrowWhite,
  iconWaves,
  iconFlame,
  iconBallCard
} from '../constants/figmaAssets';
import { formatAmount } from '../constants/dateTimeHelpers';

const CATEGORY_STYLE = {
  'Înot': { className: 'swim', icon: iconWaves },
  'Relaxare': { className: 'relax', icon: iconFlame },
  'Sporturi': { className: 'sport', icon: iconBallCard }
};

export default function FacilitiesScreen({
  facilitiesList,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  onOpenDetails,
  onOpenMap,
  currency
}) {
  const openTodayText = (facility) =>
    facility.opensAt && facility.closesAt
      ? `Deschis azi · ${facility.opensAt}–${facility.closesAt}`
      : facility.hours;

  const priceParts = (facility) => {
    const ron = `${formatAmount(facility.priceRon)} RON`;
    const eur = `${formatAmount(facility.priceEur)} EUR`;
    return currency === 'RON' ? [ron, eur] : [eur, ron];
  };

  const visibleFacilities = facilitiesList
    .filter((f) => activeCategory === 'Toate' || f.category === activeCategory)
    .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="sc-stack">
      <div className="sc-search-row">
        <label className="sc-search-field">
          <img src={iconSearch} alt="" />
          <input
            type="search"
            placeholder="Caută după nume…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <button className="sc-map-button" onClick={onOpenMap} aria-label="Hartă campus">
          <img src={iconMapWhite} alt="" />
        </button>
      </div>

      <div className="sc-chips">
        {['Toate', 'Înot', 'Relaxare', 'Sporturi'].map((cat) => (
          <button
            key={cat}
            className={`sc-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="sc-list-summary">{visibleFacilities.length} facilități · prețuri / interval</p>

      {visibleFacilities.map((facility) => {
        const style = CATEGORY_STYLE[facility.category] || CATEGORY_STYLE['Sporturi'];
        const [mainPrice, otherPrice] = priceParts(facility);

        return (
          <article
            key={facility.id}
            className="sc-facility-card"
            onClick={() => onOpenDetails(facility)}
          >
            <div className={`sc-card-banner ${style.className}`}>
              <img className="sc-card-decor" src={decorCard} alt="" />
              <span className="sc-card-category">{facility.category}</span>
              <img className="sc-card-icon" src={style.icon} alt="" />
            </div>

            <div className="sc-card-body">
              <h3 className="sc-card-title">{facility.name}</h3>
              <p className="sc-card-subtitle">{facility.subtitle}</p>

              {facility.badgeAlert && (
                <span className="sc-promo">
                  <img src={iconTag} alt="" />
                  {facility.badgeAlert}
                </span>
              )}

              <span className="sc-open-today">
                <img src={dotOpen} alt="" />
                {openTodayText(facility)}
              </span>

              <div className="sc-price-row">
                <span className="sc-price">
                  <strong>{mainPrice}</strong>
                  <span>/ {otherPrice}</span>
                </span>
                <button
                  className="sc-btn-details"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails(facility);
                  }}
                >
                  Detalii
                  <img src={iconArrowWhite} alt="" />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
