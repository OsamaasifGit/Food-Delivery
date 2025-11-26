
import React, { useContext, useEffect } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext';

const verify = () => {
    const [searchParams,setSearchParams] = useSearchParams();
    const success = searchParams.get("success");
     const orderId = searchParams.get("orderId");
     const {url} = useContext(StoreContext);
     const navigate = useNavigate();

     const verifyPayment = async () => {
        const response = await axios.post(url+"/api/order/verify",{success,orderId});
        if (response.data.success){
           navigator("/myorders")
        }
        else{
            navigate("/")
        }
     }

     useEffect(()=>{
          verifyPayment();
     },[])

  return (
    // <div className='verify'>
    //     <div className='spinner'>

    //     </div>
      
    // </div>
     <div className="verify-page">
      {success === "true" ? (
        <div>
          <h1>Order Verified</h1>
          <p>Your payment was successful. Thank you!</p>
        </div>
      ) : success === "false" ? (
        <div>
          <h1>Verification Failed</h1>
          <p>There was a problem verifying your order. Please try again.</p>
        </div>
      ) : (
        <div>
          <h1>Verification</h1>
          <p>No verification status found.</p>
        </div>
      )}
    </div>
  )
}

export default verify



// src/pages/Verify/Verify.jsx
/*
import React from "react";
import { useSearchParams } from "react-router-dom";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success"); // <- correct syntax

  return (
    <div className="verify-page">
      {success === "true" ? (
        <>
          <h1>Order Verified</h1>
          <p>Your payment was successful. Thank you!</p>
        </>
      ) : success === "false" ? (
        <>
          <h1>Verification Failed</h1>
          <p>There was a problem verifying your order. Please try again.</p>
        </>
      ) : (
        <>
          <h1>Verification</h1>
          <p>No verification status found.</p>
        </>
      )}
    </div>
  );
};

export default Verify;
*/