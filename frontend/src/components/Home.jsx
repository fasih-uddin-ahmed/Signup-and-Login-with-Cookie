import React, { useEffect} from 'react';
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Home() {

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    
    axios.get('http://localhost:3001/', {
    withCredentials: true
      })
        .then((res) => {
            if (res.data.status === 'error') {
              console.log(res.data.message);
              navigate('/');
          } else {
            console.log("user already logged in", res.data.user_type );
          }

        })
        .catch((error) => {
            console.error('Error checking session:', error);
        });

}, []);

  const handleLogout = () => {
    // Make a logout request 
    axios.get('http://localhost:3001/logout', { withCredentials: true })
        .then((res) => {

            if (res.status === 200 && res.data.status === 'success') {
              
              console.log(res.data.message)
              navigate('/');
            } else {
              // Server responded with an error
              console.log('Log in failed:', res.data.message);
            }
          })
          .catch((error) => {
            console.error('Error during logout', error);
          });
};

return (
    <div>
        <h1>Welcome to Home</h1>
        <button onClick={handleLogout}>Logout</button>
    </div>
)
}

export default Home;
