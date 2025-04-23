import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from "firebase/app";

// --- Firebase Configuration ---
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: email.split('@')[0],
          email: email,
        });
        await sendEmailVerification(userCredential.user);
        setMessage("Registration successful! Please check your email to verify your account.");
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user.emailVerified) {
          setMessage("Email not verified. Please check your inbox.");
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
      setMessage("Please enter your email address to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h2>{isRegistering ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
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

        {/* Optional reCAPTCHA (manual setup required) */}
        {/* <div className="g-recaptcha" data-sitekey="YOUR_SITE_KEY"></div> */}

        <button type="submit" disabled={isLoading}>
          {isLoading
            ? (isRegistering ? "Registering..." : "Logging in...")
            : (isRegistering ? "Register" : "Login")}
        </button>
      </form>

      {!isRegistering && (
        <p style={{ marginTop: '10px' }}>
          <button onClick={() => setShowForgotPassword(!showForgotPassword)} style={{ border: 'none', background: 'none', color: 'blue', cursor: 'pointer' }}> // here is some CSS for the register button
            Forgot Password?
          </button>
        </p>
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

      <p>{message}</p>

      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? "Login Instead" : "Register Instead"}
      </button>
    </div>
  );
}

export default Login;




