import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY",
  authDomain: "ctrl-shift-deploy.firebaseapp.com",
  databaseURL: "https://ctrl-shift-deploy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ctrl-shift-deploy",
  storageBucket: "ctrl-shift-deploy.firebasestorage.app",
  messagingSenderId: "1008311150868",
  appId: "1:1008311150868:web:5d8db4655fbe8de360ba01",
  measurementId: "G-HXZWM4BW31"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          setMessage("Passwords do not match.");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: email.split('@')[0],
          email: email,
        });
        await sendEmailVerification(userCredential.user);
        setMessage("Registration successful! Please verify your email.");
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        if (!userCredential.user.emailVerified) {
          setMessage("Email not verified. Check your inbox.");
          return;
        }

        setMessage("Login successful!");
        onLogin(userCredential.user);
        navigate('/dashboard');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="background-image" />
      <div className="overlay" />

      <div className="login-container">
        <h2>Welcome to Ride TO Class</h2>
        <p>School Transport Made Easy</p>

        <div className="form-toggle">
          <button
            className={!isRegistering ? 'active' : ''}
            onClick={() => { setIsRegistering(false); setMessage(''); }}
          >
            Login
          </button>
          <button
            className={isRegistering ? 'active' : ''}
            onClick={() => { setIsRegistering(true); setMessage(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          {isRegistering && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          )}
          <button type="submit" disabled={isLoading}>
            {isLoading
              ? (isRegistering ? "Registering..." : "Logging in...")
              : (isRegistering ? "Register" : "Login")}
          </button>
        </form>

        {!isRegistering && (
          <div className="register-link">
            <button
              onClick={() => setShowForgotPassword(!showForgotPassword)}
              style={{ border: 'none', background: 'none', color: 'blue', cursor: 'pointer' }}
            >
              Forgot password?
            </button>
          </div>
        )}

        {showForgotPassword && (
          <form onSubmit={handleForgotPassword}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            <button type="submit" disabled={isLoading}>
              Send Reset Link
            </button>
          </form>
        )}

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default Login;




