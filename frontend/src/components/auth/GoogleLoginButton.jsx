import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GoogleLoginButton() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  return (
    <GoogleLogin
      onSuccess={async (res) => {
        try {
          await googleLogin(res.credential);
          navigate('/dashboard');
        } catch (e) {
          alert('Google login failed');
        }
      }}
      onError={() => alert('Google login failed')}
    />
  );
}