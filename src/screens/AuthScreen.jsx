import React from 'react';
import {
  iconInfoRed,
  iconArrowDark,
  iconLock,
  iconCheck
} from '../constants/figmaAssets';

// Rolurile care își pot face singure cont (RECEPTIONIST și ADMIN le creează administratorul) – KAN-69
const REGISTER_ROLES = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'PROFESSOR', label: 'Profesor' },
  { value: 'AMATEUR', label: 'Amator' }
];

const EMAIL_LABELS = {
  STUDENT: 'Email de student',
  PROFESSOR: 'Email instituțional',
  AMATEUR: 'Email'
};

const EMAIL_PLACEHOLDERS = {
  STUDENT: 'ana.popescu@stud.univ.ro',
  PROFESSOR: 'ana.popescu@univ.ro',
  AMATEUR: 'ana.popescu@email.ro'
};

export default function AuthScreen({
  mode = 'login',
  loginForm,
  setLoginForm,
  loginError,
  showLoginPassword,
  setShowLoginPassword,
  onLogin,
  registerForm,
  setRegisterForm,
  registerErrors,
  showRegisterPassword,
  setShowRegisterPassword,
  onRegister,
  authSubmitting,
  goToLogin,
  goToRegister
}) {
  if (mode === 'login') {
    return (
      <div className="sc-stack">
        <form className="sc-form-card" onSubmit={onLogin} noValidate>
          {loginError && (
            <div className="sc-alert-error" role="alert">
              <img src={iconInfoRed} alt="" />
              <span>{loginError}</span>
            </div>
          )}

          <label className="sc-field">
            <span className="sc-label">Email</span>
            <span className={`sc-input ${loginError ? 'error' : ''}`}>
              <input
                type="email"
                autoComplete="email"
                placeholder="ana.popescu@stud.univ.ro"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
            </span>
          </label>

          <label className="sc-field">
            <span className="sc-label">Parolă</span>
            <span className={`sc-input ${loginError ? 'error' : ''}`}>
              <input
                type={showLoginPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
              <button
                type="button"
                className="sc-input-toggle"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
              >
                {showLoginPassword ? 'Ascunde' : 'Arată'}
              </button>
            </span>
          </label>

          <div className="sc-link-row">
            <button type="button" className="sc-link">Ai uitat parola?</button>
          </div>

          <button type="submit" className="sc-btn-primary" disabled={authSubmitting}>
            {authSubmitting ? 'Se verifică…' : 'Autentifică-te'}
            <img src={iconArrowDark} alt="" />
          </button>
        </form>

        <div className="sc-divider"><span>sau</span></div>

        <div className="sc-new-account">
          <p>Nu ai încă un cont?</p>
          <button type="button" className="sc-btn-secondary" onClick={goToRegister}>
            Creează un cont
          </button>
        </div>

        <div className="sc-info">
          <img src={iconLock} alt="" />
          <span>Un singur cont pentru rezervări, plata online și accesul în facilități.</span>
        </div>
      </div>
    );
  }

  return (
    <form className="sc-stack" onSubmit={onRegister} noValidate>
      <div className="sc-form-card">
        {registerErrors.general && (
          <div className="sc-alert-error" role="alert">
            <img src={iconInfoRed} alt="" />
            <span>{registerErrors.general}</span>
          </div>
        )}

        <div className="sc-field">
          <span className="sc-label" id="register-role-label">Cont de</span>
          <div className="sc-role-options" role="radiogroup" aria-labelledby="register-role-label">
            {REGISTER_ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                role="radio"
                aria-checked={registerForm.roleType === role.value}
                className={`sc-role-option ${registerForm.roleType === role.value ? 'active' : ''}`}
                onClick={() => setRegisterForm({ ...registerForm, roleType: role.value })}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        <label className="sc-field">
          <span className="sc-label">Nume și prenume</span>
          <span className={`sc-input ${registerErrors.fullName ? 'error' : ''}`}>
            <input
              type="text"
              autoComplete="name"
              placeholder="Ana Popescu"
              value={registerForm.fullName}
              onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
            />
          </span>
          {registerErrors.fullName && <span className="sc-field-error">{registerErrors.fullName}</span>}
        </label>

        <label className="sc-field">
          <span className="sc-label">{EMAIL_LABELS[registerForm.roleType] || 'Email'}</span>
          <span className={`sc-input ${registerErrors.email ? 'error' : ''}`}>
            <input
              type="email"
              autoComplete="email"
              placeholder={EMAIL_PLACEHOLDERS[registerForm.roleType] || EMAIL_PLACEHOLDERS.AMATEUR}
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            />
          </span>
          {registerErrors.email && <span className="sc-field-error">{registerErrors.email}</span>}
        </label>

        <label className="sc-field">
          <span className="sc-label">Telefon</span>
          <span className={`sc-input ${registerErrors.phone ? 'error' : ''}`}>
            <input
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="0722 123 456"
              value={registerForm.phone}
              onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
            />
          </span>
          {registerErrors.phone && <span className="sc-field-error">{registerErrors.phone}</span>}
        </label>

        {/* Numărul matricol și facultatea se cer doar studenților */}
        {registerForm.roleType === 'STUDENT' && (
          <>
            <label className="sc-field">
              <span className="sc-label">Număr matricol</span>
              <span className={`sc-input ${registerErrors.matricolNumber ? 'error' : ''}`}>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="ex. 1234/2023"
                  value={registerForm.matricolNumber}
                  onChange={(e) => setRegisterForm({ ...registerForm, matricolNumber: e.target.value })}
                />
              </span>
              {registerErrors.matricolNumber && <span className="sc-field-error">{registerErrors.matricolNumber}</span>}
            </label>

            <label className="sc-field">
              <span className="sc-label">Facultate</span>
              <span className={`sc-input ${registerErrors.faculty ? 'error' : ''}`}>
                <input
                  type="text"
                  autoComplete="organization"
                  placeholder="ex. Inginerie Electrică și Știința Calculatoarelor"
                  value={registerForm.faculty}
                  onChange={(e) => setRegisterForm({ ...registerForm, faculty: e.target.value })}
                />
              </span>
              {registerErrors.faculty && <span className="sc-field-error">{registerErrors.faculty}</span>}
            </label>
          </>
        )}

        <label className="sc-field">
          <span className="sc-label">Parolă</span>
          <span className={`sc-input ${registerErrors.password ? 'error' : ''}`}>
            <input
              type={showRegisterPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            />
            <button
              type="button"
              className="sc-input-toggle"
              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
            >
              {showRegisterPassword ? 'Ascunde' : 'Arată'}
            </button>
          </span>
          {registerErrors.password && <span className="sc-field-error">{registerErrors.password}</span>}
          <span className="sc-field-hint">Folosește o parolă unică pentru acest cont.</span>
        </label>
      </div>

      <label className="sc-consent">
        <input
          type="checkbox"
          checked={registerForm.acceptedTerms}
          onChange={(e) => setRegisterForm({ ...registerForm, acceptedTerms: e.target.checked })}
        />
        <span className="sc-checkbox" aria-hidden="true">
          <img src={iconCheck} alt="" />
        </span>
        <span>
          Accept termenii de utilizare și am citit informarea privind datele personale.
          {registerErrors.terms && <span className="sc-field-error sc-block">{registerErrors.terms}</span>}
        </span>
      </label>

      <button type="submit" className="sc-btn-primary" disabled={authSubmitting}>
        {authSubmitting ? 'Se creează contul…' : 'Creează contul'}
        <img src={iconArrowDark} alt="" />
      </button>

      <button type="button" className="sc-btn-secondary" onClick={goToLogin}>
        Ai deja cont? Autentifică-te
      </button>
    </form>
  );
}
