import React,{useState, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

import validation from '../utils/loginValidation'

function Login() {

    const [values, setValues] = useState({
        email: '',
        password: ''
    })

    const [errors, setErrors] = useState({})

    const navigate = useNavigate();
    
  useEffect(() => {
    
            axios.get('http://localhost:3001/', {
      withCredentials: true
        })
          .then((res) => {
              if (res.status === 200 && res.data.status === 'success') {
                  // Session is active, redirect to home page
                  navigate('/home');
              }
              else {
                console.log(res.data.message);
              }

          })
          .catch((error) => {
              console.error('Error checking session:', error);
          });

  }, []); 
    
    const handleInput = (event) => {
      console.log("handle input is called");
        setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
      };
      
    
    const handleSubmit = (event) => {
        event.preventDefault();
        
        const err = validation(values); 
        setErrors(err);

        if ( err.email === '' && err.password === '') {
          axios.post('http://localhost:3001/login', values,
        {
          withCredentials: true,
          headers: {
              'Content-Type': 'application/json'
          }})
        .then((res) => {
          
          if (res.status === 200 && res.data.status === 'success') {
            // Registration successful
            console.log('Logged in successful', res.data.user_type);
            
            navigate('/home');
          } else {
            // Server responded with an error
            console.log('Log in failed:', res.data.message);
            
          }
        })
        .catch((error) => {
          
          console.error('Error during registration:', error);
          
        });
      }
    }

  return (
    <div className='d-flex justify-content-center align-items-center bg-black vh-100'>
    <div className='bg-white p-3 rounded w-25'>
        <h2>Sign In</h2>
            <form action="" onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor='email'><strong>Email</strong></label>
                    <input type='email' placeholder='Enter Email.' className='form-control rounded-0' name='email' onChange={handleInput}/>
                    <span>{errors.email && <span className='text-danger'> {errors.email} </span>}</span>
                </div>
                <div className='mb-3'>
                <label htmlFor='password'><strong>Password</strong></label>
                <input type='password' placeholder='Enter Password.' className='form-control rounded-0' name='password' onChange={handleInput}/>
                <span>{errors.password && <span className='text-danger'> {errors.password} </span>}</span>
                </div>
                <button type='submit' className='btn btn-success w-100'>Log in</button>
                <p>Your are agreeing to our terms and conditions</p>
                <Link to="/signup" className='btn btn-default border w-100 bg-light text-decoration-none'>Sign up</Link>
            </form>
    </div>
</div>
  )
}

export default Login