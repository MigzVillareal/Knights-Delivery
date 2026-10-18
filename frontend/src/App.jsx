import { useState } from 'react';

const categories = [
  { id: 'food', label: 'Food', color: '#F5E08B' },
  { id: 'groceries', label: 'Groceries', color: '#ABBFDA' },
  { id: 'documents', label: 'Documents', color: '#90D9AE' },
  { id: 'other', label: 'Other', color: '#BAB7D3' },
];
const emptyRequest = { category: '', pickup: '', details: '', dropoff: '', handoff: '', estimate: '' };

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState('signin');
  const [currentUser, setCurrentUser] = useState(null);
  const [authNotice, setAuthNotice] = useState('');
  const [requestStep, setRequestStep] = useState('closed');
  const [request, setRequest] = useState(emptyRequest);
  const [categoryError, setCategoryError] = useState('');
  const [requestNotice, setRequestNotice] = useState('');
  const closeMenu = () => setMenuOpen(false);

  function handleAuthSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const enteredName = String(formData.get('name') || '').trim();
    const displayName = enteredName || email.split('@')[0] || 'Knight';
    // This is an in-memory prototype sign-in only; no credentials are sent or stored.
    setCurrentUser({ displayName, email });
    setAuthNotice('');
    setRequestStep('closed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function signOut() {
    setCurrentUser(null);
    setRequestStep('closed');
    setRequest(emptyRequest);
    setRequestNotice('');
    setMode('signin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateRequest(event) {
    const { name, value } = event.target;
    setRequest(current => ({ ...current, [name]: value }));
  }

  function handleRequestSubmit(event) {
    event.preventDefault();
    if (!request.category) {
      setCategoryError('Choose a request category to continue.');
      return;
    }
    setCategoryError('');
    setRequestNotice('');
    setRequestStep('review');
    document.getElementById('request-flow')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function startRequest() {
    setRequest(emptyRequest);
    setCategoryError('');
    setRequestNotice('');
    setRequestStep('form');
    document.getElementById('request-flow')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function finishReview() {
    setRequestNotice('This request was not sent or saved.');
  }

  const selectedCategory = categories.find(category => category.id === request.category);

  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="page-shell" id="home">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Knights Delivery home" onClick={closeMenu}><span className="brand-mark" aria-hidden="true">K</span><span>Knights <strong>Delivery</strong></span></a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setMenuOpen(open => !open)}><span /><span /><span className="visually-hidden">Menu</span></button>
        <nav id="primary-navigation" className={`navigation ${menuOpen ? 'navigation-open' : ''}`} aria-label="Main navigation">
          {currentUser ? <><a href="#customer-home" onClick={closeMenu}>Home</a><a href="#past-requests" onClick={closeMenu}>Past requests</a><button className="nav-signout" type="button" onClick={() => { closeMenu(); signOut(); }}>Sign out</button></> : <a href="#sign-in" onClick={closeMenu}>Sign in</a>}
        </nav>
      </header>
      <main id="main-content">
        {!currentUser ? <>
          <section className="auth-section" id="sign-in" aria-labelledby="auth-title">
            <div className="auth-copy"><p className="eyebrow">A LITTLE HELP, RIGHT ON CAMPUS</p><h1 id="auth-title">Campus errands,<br /><em>made simpler.</em></h1><p className="intro">Knights Delivery is exploring a simpler way for students to get small campus errands done.</p><div className="hero-note"><span className="note-icon" aria-hidden="true">✳</span><p>Sign-in is not connected yet. Use placeholder details; they are not sent or saved.</p></div></div>
            <div className="auth-card">
              <div className="auth-tabs" role="tablist" aria-label="Choose sign-in or sign-up">
                <button className={mode === 'signin' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => { setMode('signin'); setAuthNotice(''); }}>Sign in</button>
                <button className={mode === 'signup' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => { setMode('signup'); setAuthNotice(''); }}>Sign up</button>
              </div>
              <h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2><p className="auth-description">{mode === 'signin' ? 'Sign in to continue.' : 'Create an account to continue.'}</p>
              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {mode === 'signup' && <label>Name<input name="name" type="text" autoComplete="name" placeholder="Your name" required /></label>}
                <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
                <label>Password<input name="password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="Enter your password" minLength="6" required /></label>
                <button className="primary-button" type="submit">{mode === 'signin' ? 'Sign in' : 'Create account'}</button>
              </form>
              <p className="form-disclaimer">Sign-in is not connected yet. Do not enter a real password; account details are not saved.</p>{authNotice && <p className="form-notice" role="status">{authNotice}</p>}
            </div>
          </section>
        </> : <>
          <section className="customer-home" id="customer-home" aria-labelledby="home-title">
            <div><p className="eyebrow">YOUR DELIVERY HOME</p><h1 id="home-title">Welcome, {currentUser.displayName}.</h1><p className="intro">Start a campus delivery request.</p></div>
            <button className="primary-button home-request-button" type="button" onClick={startRequest}>Create a request <span aria-hidden="true">→</span></button>
          </section>
          {requestStep !== 'closed' && <section className="request-section" id="request-flow" aria-labelledby="request-title">
            <div className="request-section-heading"><div><p className="eyebrow">NEW REQUEST</p><h2 id="request-title">Create a delivery request</h2><p className="request-intro">Add the details below, then review your request.</p></div></div>
            {requestStep === 'form' && <form className="request-card request-form" onSubmit={handleRequestSubmit}>
              <div className="request-card-heading"><div><span className="step-label">STEP 1 OF 2</span><h3>Request details</h3></div><button className="text-button" type="button" onClick={() => setRequestStep('closed')}>Close</button></div>
              <fieldset className="category-fieldset"><legend>What do you need? <span className="required-indicator">Required</span></legend><div className="category-options">{categories.map(category => <button key={category.id} className={`category-chip ${request.category === category.id ? 'selected' : ''}`} style={{ '--category-color': category.color }} type="button" aria-pressed={request.category === category.id} onClick={() => { setRequest(current => ({ ...current, category: category.id })); setCategoryError(''); }}>{category.label}</button>)}</div>{categoryError && <p className="field-error" role="alert">{categoryError}</p>}</fieldset>
              <div className="request-field-grid"><label>Pickup source / location <span className="required-indicator">Required</span><input name="pickup" value={request.pickup} onChange={updateRequest} placeholder="Building, shop, or pickup point" required /></label><label>Precise drop-off location <span className="required-indicator">Required</span><input name="dropoff" value={request.dropoff} onChange={updateRequest} placeholder="Building, room, or meeting point" required /></label></div>
              <label>Item details <span className="required-indicator">Required</span><textarea name="details" value={request.details} onChange={updateRequest} rows="3" placeholder="Describe what should be picked up" required /></label>
              <label>Handoff note <span className="optional-indicator">Optional</span><textarea name="handoff" value={request.handoff} onChange={updateRequest} rows="2" placeholder="Anything helpful for the handoff?" /></label>
              <label>Your estimate <span className="optional-indicator">Optional</span><input name="estimate" value={request.estimate} onChange={updateRequest} inputMode="decimal" placeholder="Enter an estimate if you have one" /><span className="field-help">No fee is set yet. Currency and any service fee are pending approval.</span></label>
              <div className="request-actions"><button className="primary-button" type="submit">Review request <span aria-hidden="true">→</span></button></div>
            </form>}
            {requestStep === 'review' && <div className="request-card review-card" aria-labelledby="review-title">
              <div className="request-card-heading"><div><span className="step-label">STEP 2 OF 2 · REVIEW</span><h3 id="review-title">Review your request</h3></div><button className="text-button" type="button" onClick={() => { setRequestStep('form'); setRequestNotice(''); }}>Edit details</button></div>
              <dl className="request-summary"><div><dt>Category</dt><dd><span className="review-category" style={{ '--category-color': selectedCategory?.color }}>{selectedCategory?.label}</span></dd></div><div><dt>Pickup source / location</dt><dd>{request.pickup}</dd></div><div><dt>Item details</dt><dd>{request.details}</dd></div><div><dt>Precise drop-off</dt><dd>{request.dropoff}</dd></div><div><dt>Handoff note</dt><dd>{request.handoff || 'None provided'}</dd></div><div><dt>Your estimate</dt><dd>{request.estimate.trim() || 'Not provided'}</dd></div></dl>
              <div className="fee-notice"><strong>Fee information: Pending approval</strong><span>No fee amount has been set; this is not a quote.</span></div><p className="review-disclaimer">This form is not connected. The request will not be sent or saved.</p>
              <div className="request-actions"><button className="primary-button" type="button" onClick={finishReview}>Complete review</button></div>{requestNotice && <p className="form-notice" role="status">{requestNotice}</p>}
            </div>}
          </section>}
          <section className="past-requests" id="past-requests" aria-labelledby="past-requests-title"><div className="section-heading"><div><p className="eyebrow">YOUR ACTIVITY</p><h2 id="past-requests-title">Past requests</h2></div></div><div className="request-empty"><span className="empty-mark" aria-hidden="true">✳</span><p>No past requests yet.</p><span>Requests will appear here when request saving is connected.</span></div></section>
        </>}
      </main>
      <footer className="footer"><span>KNIGHTS DELIVERY SYSTEM</span><span>Built for campus, shaped by students</span></footer>
    </div>
  </>;
}
