// --- Firebase Configuration (Client-Side) ---
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

// --- Login Component (React) ---
function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const navigate = useNavigate(); // For redirect after login

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        try {
            let userCredential;
            if (isRegistering) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    name: email.split('@')[0],
                    email: email,
                });
                setMessage('Registration Successful');
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                setMessage('Login Successful');
            }
            onLogin(userCredential.user);
            navigate('/dashboard'); // Redirect after login
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2>{isRegistering ? 'Register' : 'Login'}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                />
                <input
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                />
                
                {/* 👇 Forgot Password link */}
                {!isRegistering && (
                    <p style={{ marginTop: '10px' }}>
                        <a href="/forgot-password">Forgot Password?</a>
                    </p>
                )}

                <button type='submit' disabled={isLoading}>
                    {isLoading
                        ? (isRegistering ? 'Registering...' : 'Logging in...')
                        : (isRegistering ? 'Register' : 'Login')}
                </button>
            </form>
            <p>{message}</p>
            <button onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? 'Login Instead' : 'Register Instead'}
            </button>
        </div>
    );
}

export default Login;


