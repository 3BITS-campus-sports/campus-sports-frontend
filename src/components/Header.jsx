import React from 'react';
import { decorHero1, decorHero2, logoBall } from '../constants/figmaAssets';
import { formatAmount } from '../constants/dateTimeHelpers';

const AUTH_SCREENS = ['login', 'register'];

export default function Header({
  currentScreen,
  setCurrentScreen,
  authToken,
  lang,
  setLang,
  currency,
  setCurrency,
  onOpenHelp,
  onOpenAccount,
  selectedFacility,
  booking
}) {
  return (
    <header className="figma-header sc-hero">
      <img className="sc-hero-decor sc-hero-decor-1" src={decorHero1} alt="" />
      <img className="sc-hero-decor sc-hero-decor-2" src={decorHero2} alt="" />

      <div className="sc-hero-bar">
        <button
          className="sc-brand"
          onClick={() => setCurrentScreen(authToken ? 'facilities' : 'login')}
        >
          <span className="sc-logo"><img src={logoBall} alt="" /></span>
          Sport Campus
        </button>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="sc-header-action" type="button" onClick={onOpenHelp}>
            Ajutor
          </button>
          {!AUTH_SCREENS.includes(currentScreen) && (
            <button className="sc-header-action" onClick={onOpenAccount}>
              Contul meu
            </button>
          )}
        </div>
      </div>

      <div className="sc-hero-switches">
        <div className="sc-switch" role="group" aria-label="Limbă">
          <button className={lang === 'ro' ? 'active' : ''} onClick={() => setLang('ro')}>RO</button>
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
        </div>
        <div className="sc-switch" role="group" aria-label="Monedă">
          <button className={currency === 'RON' ? 'active' : ''} onClick={() => setCurrency('RON')}>RON</button>
          <button className={currency === 'EUR' ? 'active' : ''} onClick={() => setCurrency('EUR')}>EUR</button>
        </div>
      </div>

      {/* Titlu Dinamic per Ecran */}
      {currentScreen === 'login' && (
        <div>
          <h2 className="figma-header-title">Autentificare</h2>
          <p className="figma-header-desc">Intră în cont pentru a rezerva o facilitate sportivă.</p>
        </div>
      )}

      {currentScreen === 'register' && (
        <div>
          <h2 className="figma-header-title">Creare cont</h2>
          <p className="figma-header-desc">Un singur pas. Alege tipul contului și completează datele.</p>
        </div>
      )}

      {currentScreen === 'facilities' && (
        <div>
          <h2 className="figma-header-title">Facilități</h2>
          <p className="figma-header-desc">Alege unde vrei să faci mișcare.</p>
        </div>
      )}

      {currentScreen === 'account' && (
        <div>
          <h2 className="figma-header-title">Contul meu</h2>
          <p className="figma-header-desc">Date profil, preferințe și administrare sesiune</p>
        </div>
      )}

      {currentScreen === 'reception' && (
        <div>
          <h2 className="figma-header-title">Scanare QR Recepție</h2>
          <p className="figma-header-desc">Validare bilet electronic de acces la intrarea în facilitate</p>
        </div>
      )}

      {currentScreen === 'admin' && (
        <div>
          <h2 className="figma-header-title">Panou Administrare (Admin)</h2>
          <p className="figma-header-desc">Gestionare facilități & utilizatori direct în baza de date</p>
        </div>
      )}

      {currentScreen === 'facility_detail' && selectedFacility && (
        <div>
          <h2 className="figma-header-title">{selectedFacility.name}</h2>
          <p className="figma-header-desc">{selectedFacility.category} · {selectedFacility.subtitle.split(' · ')[0]}</p>
        </div>
      )}

      {currentScreen === 'choose_datetime' && selectedFacility && (
        <div>
          <h2 className="figma-header-title">Alege data și ora</h2>
          <p className="figma-header-desc">
            {selectedFacility.name} · {selectedFacility.slotMinutes || 60} min · {formatAmount(selectedFacility.priceRon)} RON / {formatAmount(selectedFacility.priceEur)} EUR
          </p>
        </div>
      )}

      {currentScreen === 'summary_payment' && (
        <div>
          <h2 className="figma-header-title">Rezumat și plată</h2>
          <p className="figma-header-desc">Verifică datele rezervării înainte de a continua la plata externă.</p>
        </div>
      )}

      {currentScreen === 'payment_failed' && (
        <div>
          <h2 className="figma-header-title">Plată eșuată</h2>
          <p className="figma-header-desc">Tranzacția nu a putut fi procesată de bancă</p>
        </div>
      )}

      {currentScreen === 'confirmed_ticket' && (
        <div>
          <h2 className="figma-header-title">Rezervare confirmată</h2>
          {booking?.booking_code && (
            <p className="figma-header-desc">
              {Number(booking.total_amount) > 0 ? 'Plătită' : 'Gratuită'} · Cod rezervare {booking.booking_code}
            </p>
          )}
        </div>
      )}

      {currentScreen === 'my_bookings' && (
        <div>
          <h2 className="figma-header-title">Rezervările mele</h2>
          <p className="figma-header-desc">Rezervările și codurile tale de acces</p>
        </div>
      )}

      {currentScreen === 'map' && (
        <div>
          <h2 className="figma-header-title">Harta Campus</h2>
          <p className="figma-header-desc">Localizarea sălilor și a terenurilor sportive</p>
        </div>
      )}
    </header>
  );
}
