import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'

import axios from 'axios';
import validation from '../utils/signupValidation'

const Signup = () => {
  const [values, setValues] = useState({ name: '', matriculation: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };


  useEffect(() => {
    // Check for if user is already logged in
    axios.get('http://localhost:3001/', {
    withCredentials: true
      })
        .then((res) => {
            if (res.status === 200 && res.data.status === 'success') {
                // Session is active, redirect to home page
                navigate('/home');
            }
            if (res.data.status === 'error') {
              console.log('no cookie', res.data.message);
              return;
          }
        })
        .catch((error) => {
            console.error('Error checking session:', error);
        });
}, []);


  const handleSubmit = (event) => {
    event.preventDefault();
    const err = validation(values); 
    setErrors(err);


    if (err.name === '' && err.matriculation === '' && err.email === '' && err.password === '') {

        axios.post('http://localhost:3001/register', values) 
          .then((res) => {

            if (res.status === 200 && res.data.status === 'success') {
              console.log('Registration successful');
              
              navigate('/');
            } else {
              // Server responded with an error
              console.log('Registration failed:', res.data.message);
              
            }
          })
          .catch((error) => {
            
            console.error('Error during registration:', error);

          });

    }


  };

  return (
    <div className='d-flex justify-content-center align-items-center bg-black vh-100'>
      <div className='bg-white p-3 rounded w-25'>
      <h2>Signup</h2>
      <form action="" onSubmit={handleSubmit}>
        <div className='mb-3'>
        <label htmlFor='name'><strong>Name</strong></label>
          <input type="text" name="name" className='form-control rounded-0' onChange={handleInput} />
          <span>{errors.name && <span className='text-danger'> {errors.name} </span>}</span>
        </div>
        <div className='mb-3'>
        <label htmlFor='Matrculation'><strong>Matriculation No.</strong></label>
          <input type="text" name="matriculation" className='form-control rounded-0' onChange={handleInput} />
          <span>{errors.matriculation && <span className='text-danger'> {errors.matriculation} </span>}</span>
        </div>
        <div className='mb-3'>
        <label htmlFor='email'><strong>Email</strong></label>
          <input type="email" name="email" className='form-control rounded-0' onChange={handleInput} />
          <span>{errors.email && <span className='text-danger'> {errors.email} </span>}</span>
        </div>
        <div className='mb-3'>
        <label htmlFor='password'><strong>Password</strong></label>
          <input type="password" name="password" className='form-control rounded-0' onChange={handleInput} />
          <span>{errors.password && <span className='text-danger'> {errors.password} </span>}</span>
        </div>
        <button className='btn btn-success w-100' type="submit">Signup</button>
        <p>You agree to our terms and policies.</p>
        <Link to="/" className='btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>Login</Link>
      </form>
      </div>
    </div>



  );
};

export default Signup;
