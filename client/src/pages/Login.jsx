import api from '../services/api';

export default function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const login = async () => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        alert('Login successful');
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="email" placeholder="Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} />
            <input type="password"
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} />
            <button onClick={login}>Login</button>
        </div>
    );
}