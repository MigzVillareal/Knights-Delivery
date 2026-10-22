import { useState } from 'react';
import buildingImg from '../image/building.png';

export default function GatePage({ onLogin }) {
  const [form, setForm] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('juandelacruz@adnu.edu.ph');
  const [pass, setPass] = useState('knights123');
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState('');
  const [sid, setSid] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');
  const [showSuPass, setShowSuPass] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    if (!email || pass.length < 6) return;
    const resolvedName = email.toLowerCase().startsWith('juandelacruz')
      ? 'Juan Dela Cruz'
      : email.split('@')[0];
    onLogin({ email, name: resolvedName });
  }

  function handleSignup(e) {
    e.preventDefault();
    if (!name || !sid || !suEmail || suPass.length < 6) return;
    onLogin({ email: suEmail, name });
  }

  return (
    <div className="gate" id="gate">
      {/* Left brand panel with campus building background */}
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
                    />
                    <span className="trail">
                      <button className="iconbtn ghost" type="button" style={{ width: 40, height: 40 }}
                        onClick={() => setShowPass(v => !v)}>
                        <i className={`fa-solid fa-${showPass ? 'eye-slash' : 'eye'}`} />
                      </button>
                    </span>
                  </div>
                </div>
                <button className="btn btn-primary" type="submit" style={{ marginTop: 16 }}>Log In</button>
              </form>

              <div className="authfoot">
                New to Knights Delivery?{' '}
                <button className="link" type="button" onClick={() => setForm('signup')}>Sign Up</button>
              </div>
              <p className="gate-foot">Demo: any email &amp; password (6+ chars) will work.</p>
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
                      value={name} onChange={e => setName(e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label>Student ID</label>
                  <div className="inputwrap">
                    <span className="lead"><i className="fa-solid fa-id-card" /></span>
                    <input className="input has-lead" type="text" placeholder="2023-10482"
                      value={sid} onChange={e => setSid(e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label>Email</label>
                  <div className="inputwrap">
                    <span className="lead"><i className="fa-solid fa-envelope" /></span>
                    <input className="input has-lead" type="email" placeholder="juandelacruz@gbox.adnu.edu.ph"
                      value={suEmail} onChange={e => setSuEmail(e.target.value)} />
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
                      style={{ paddingRight: 52 }} />
                    <span className="trail">
                      <button className="iconbtn ghost" type="button" style={{ width: 40, height: 40 }}
                        onClick={() => setShowSuPass(v => !v)}>
                        <i className={`fa-solid fa-${showSuPass ? 'eye-slash' : 'eye'}`} />
                      </button>
                    </span>
                  </div>
                </div>
                <button className="btn btn-primary" type="submit" style={{ marginTop: 20 }}>Create Account</button>
              </form>

              <div className="authfoot">
                Already have an account?{' '}
                <button className="link" type="button" onClick={() => setForm('login')}>Log In</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
