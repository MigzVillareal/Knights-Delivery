import { useState } from 'react';
import buildingImg from '../image/building.png';

export default function GatePage({ onLogin, onSignup, loading }) {
  const [form, setForm] = useState('login');

  // Login state
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup state
  const [name, setName] = useState('');
  const [sid, setSid] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');
  const [showSuPass, setShowSuPass] = useState(false);
  const [signupError, setSignupError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    if (!email.trim()) return setLoginError('Please enter your email.');
    if (pass.length < 6) return setLoginError('Password must be at least 6 characters.');
    try {
      await onLogin({ email: email.trim(), password: pass });
    } catch (err) {
      setLoginError(err.message || 'Login failed. Check your credentials.');
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setSignupError('');
    if (!name.trim()) return setSignupError('Please enter your full name.');
    if (!suEmail.trim()) return setSignupError('Please enter your email.');
    if (suPass.length < 6) return setSignupError('Password must be at least 6 characters.');
    try {
      await onSignup({ email: suEmail.trim(), password: suPass, name: name.trim(), sid: sid.trim() });
    } catch (err) {
      setSignupError(err.message || 'Sign up failed. Please try again.');
    }
  }

  return (
    <div className="gate" id="gate">
      {/* Left brand panel */}
      <div className="gate-brand">
        <img className="scene" src={buildingImg} alt="ADNU Campus Building" />
        <div className="gate-copy">
          <h1>Knights <span>Delivery</span></h1>
          <p>Get it. Delivered on campus.</p>
          <div className="gate-feats">
            <span className="gate-feat"><i className="fa-solid fa-person-running" />Live courier tracking</span>
            <span className="gate-feat"><i className="fa-solid fa-wallet" />Pay with Cash or E-Wallet</span>
            <span className="gate-feat"><i className="fa-solid fa-comment" />Chat with your courier</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="gate-form">
        <div className="gate-card">
          {form === 'login' ? (
            <>
              <div className="authlogo"><i className="fa-solid fa-shield-halved" /></div>
              <h1>Welcome back!</h1>
              <p className="authsub">Log in to your Knights Delivery account</p>

              <form onSubmit={handleLogin} noValidate>
                <div className="field">
                  <label>Email</label>
                  <div className="inputwrap">
                    <span className="lead"><i className="fa-solid fa-envelope" /></span>
                    <input
                      className="input has-lead" id="lg-email" type="email"
                      placeholder="juandelacruz@gbox.adnu.edu.ph"
                      value={email} onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Password</label>
                  <div className="inputwrap">
                    <span className="lead"><i className="fa-solid fa-lock" /></span>
                    <input
                      className="input has-lead" id="lg-pass"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={pass} onChange={e => setPass(e.target.value)}
                      style={{ paddingRight: 52 }}
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    <span className="trail">
                      <button className="iconbtn ghost" type="button" style={{ width: 40, height: 40 }}
                        onClick={() => setShowPass(v => !v)} disabled={loading}>
                        <i className={`fa-solid fa-${showPass ? 'eye-slash' : 'eye'}`} />
                      </button>
                    </span>
                  </div>
                </div>
                {loginError && (
                  <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
                    {loginError}
                  </p>
                )}
                <button className="btn btn-primary" type="submit" style={{ marginTop: 16 }} disabled={loading}>
                  {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Logging in...</> : 'Log In'}
                </button>
              </form>

              <div className="authfoot">
                New to Knights Delivery?{' '}
                <button className="link" type="button" onClick={() => { setForm('signup'); setLoginError(''); }}>Sign Up</button>
              </div>
            </>
          ) : (
            <>
              <div className="authlogo"><i className="fa-solid fa-shield-halved" /></div>
              <h1>Create account</h1>
              <p className="authsub">Join the Knight couriers network</p>

              <form onSubmit={handleSignup} noValidate>
                <div className="field">
                  <label>Full name</label>
                  <div className="inputwrap">
                    <span className="lead"><i className="fa-solid fa-user" /></span>
                    <input className="input has-lead" type="text" placeholder="Juan Dela Cruz"
                      value={name} onChange={e => setName(e.target.value)} disabled={loading} />
                  </div>
                </div>
                <div className="field">
                  <label>Student ID <span style={{ color: 'var(--muted)', fontWeight: 700 }}>(optional)</span></label>
                  <div className="inputwrap">
                    <span className="lead"><i className="fa-solid fa-id-card" /></span>
                    <input className="input has-lead" type="text" placeholder="2023-10482"
                      value={sid} onChange={e => setSid(e.target.value)} disabled={loading} />
                  </div>
                </div>
                <div className="field">
                  <label>Email</label>
                  <div className="inputwrap">
                    <span className="lead"><i className="fa-solid fa-envelope" /></span>
                    <input className="input has-lead" type="email" placeholder="juandelacruz@gbox.adnu.edu.ph"
                      value={suEmail} onChange={e => setSuEmail(e.target.value)}
                      autoComplete="email" disabled={loading} />
                  </div>
                </div>
                <div className="field">
                  <label>Password</label>
                  <div className="inputwrap">
                    <span className="lead"><i className="fa-solid fa-lock" /></span>
                    <input className="input has-lead"
                      type={showSuPass ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={suPass} onChange={e => setSuPass(e.target.value)}
                      style={{ paddingRight: 52 }}
                      autoComplete="new-password"
                      disabled={loading} />
                    <span className="trail">
                      <button className="iconbtn ghost" type="button" style={{ width: 40, height: 40 }}
                        onClick={() => setShowSuPass(v => !v)} disabled={loading}>
                        <i className={`fa-solid fa-${showSuPass ? 'eye-slash' : 'eye'}`} />
                      </button>
                    </span>
                  </div>
                </div>
                {signupError && (
                  <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
                    {signupError}
                  </p>
                )}
                <button className="btn btn-primary" type="submit" style={{ marginTop: 20 }} disabled={loading}>
                  {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Creating account...</> : 'Create Account'}
                </button>
              </form>

              <div className="authfoot">
                Already have an account?{' '}
                <button className="link" type="button" onClick={() => { setForm('login'); setSignupError(''); }}>Log In</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
