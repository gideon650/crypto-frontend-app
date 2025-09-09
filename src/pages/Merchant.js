import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaStar, FaCoins, FaWallet, FaCheckCircle } from "react-icons/fa";
import "./Merchant.css";

const Merchant = () => {
  const [formData, setFormData] = useState({
    name: "",
    bank_name: "",
    account_number: ""
  });
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [userStarRating, setUserStarRating] = useState(1);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  // Fetch user data, merchant's balance, pending deposits, and star rating
  useEffect(() => {
    fetchUserData();
    fetchMerchantData();
    checkUserEligibility();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/portfolio/`,
        { headers: { Authorization: `Token ${token}` }}
      );
      
      // Set the username in state and form data
      if (response.data.user?.username) {
        setUsername(response.data.user.username);
        setFormData(prev => ({
          ...prev,
          name: response.data.user.username
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const checkUserEligibility = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/portfolio/`,
        { headers: { Authorization: `Token ${token}` }}
      );
      
      const balance = response.data.balance_usd;
      let stars = 1;
      if (balance >= 5000) stars = 5;
      else if (balance >= 1001) stars = 4;
      else if (balance >= 501) stars = 3;
      else if (balance >= 101) stars = 2;
      
      setUserStarRating(stars);

      // Changed from 5 to 3 stars
      if (stars < 4) {
        setError('You need to be at least a 4-star user to become a merchant. Current rating: ' + stars + ' stars');
      }
    } catch (error) {
      setError('Failed to check eligibility');
    }
  };

  const fetchMerchantData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Fetch balance
      const balanceResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/portfolio/`,
        { 
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      const balanceData = balanceResponse.data;
      setBalance(balanceData.balance_usd || 0);

      // Fetch pending deposits
      const transactionsResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/transactions/`,
        { 
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      const transactionsData = transactionsResponse.data;
      // Filter deposits that require this merchant's action
      const pending = transactionsData.deposits?.filter(
        deposit => deposit.status === 'PENDING' && deposit.merchant_action_required
      ) || [];
      
      console.log("Pending deposits:", pending);
      setPendingDeposits(pending);
    } catch (error) {
      console.error("Error fetching merchant data:", error);
      setMessage("Error loading merchant data");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    // Prevent changing the name field
    if (e.target.name === 'name') return;
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMerchantAction = async (depositId, action) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = action === 'approve' ? 'merchant-approve-deposit' : 'merchant-decline-deposit';
      
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/${endpoint}/${depositId}/`,
        {},
        {
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setMessage(`${action === 'approve' ? 'Approved' : 'Declined'} successfully`);
      setShowPopup(true);
      
      // Refresh data after action
      fetchMerchantData();
    } catch (error) {
      console.error(`Error ${action}ing deposit:`, error);
      setMessage(error.response?.data?.message || `Error ${action === 'approve' ? 'approving' : 'declining'} deposit`);
      setShowPopup(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Changed from 5 to 3 stars
    if (userStarRating < 4) {
      setMessage("You need to be at least a 4-star user to become a merchant");
      setShowPopup(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/apply-merchant/`,
        formData,
        {
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setMessage("Success, awaiting approval");
      setShowPopup(true);
      setFormData({ name: username, bank_name: "", account_number: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Error submitting application");
      setShowPopup(true);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`star ${star <= userStarRating ? 'filled' : ''}`}
          >
            <FaStar />
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="merchant-container">
      
      {error ? (
        <div className="eligibility-container">
          <div className="error-card">
            <h2><FaCheckCircle className="error-icon" /> Eligibility Status</h2>
            <p className="error-message">{error}</p>
            <div className="requirements">
              <h3><FaCoins /> Requirements for 4-star rating:</h3>
              <ul>
                <li><span className="requirement-badge">$301+</span> Minimum balance</li>
                <li><span className="requirement-badge">Verified</span> Profile status</li>
                <li><span className="requirement-badge">Active</span> Trading history</li>
              </ul>
            </div>
            <button onClick={() => navigate('/wallet')} className="submit-button">
              <FaWallet /> Deposit Funds
            </button>
            <div className="current-rating">
              <h4>Your Current Rating:</h4>
              {renderStarRating()}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Pending Deposits Section */}
          {pendingDeposits.length > 0 && (
            <div className="merchant-form">
              <h3>Pending Deposits ({pendingDeposits.length})</h3>
              <div>
                {pendingDeposits.map(deposit => (
                  <div key={deposit.id} className="form-group">
                    <div>
                      <p>From: {deposit.user?.username || 'Unknown User'}</p>
                      <p>Amount: ${deposit.amount}</p>
                      <p>Transaction ID: {deposit.transaction_id}</p>
                      <p>Date: {new Date(deposit.created_at).toLocaleString()}</p>
                      <div>
                        Action Required: This user sent ${deposit.amount} to your bank account. 
                        Approve to credit their account (${deposit.amount} will be deducted from your balance).
                      </div>
                    </div>
                    <div className="merchant-actions">
                      <button 
                        onClick={() => handleMerchantAction(deposit.id, 'approve')}
                        className="approve-button"
                        disabled={balance < deposit.amount}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleMerchantAction(deposit.id, 'decline')}
                        className="decline-button"
                      >
                        Decline
                      </button>
                    </div>
                    {balance < deposit.amount && (
                      <div>
                        Insufficient balance to approve this deposit. You need ${deposit.amount} but have ${balance}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Merchant Application Form */}
          <div className="merchant-form">
            <h3>Become a Merchant</h3>
            <p>Apply to become a merchant and receive direct deposits from users</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name (Your Username)</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  readOnly
                  className="read-only-input"
                />
              </div>
              
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading || userStarRating < 4}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </>
      )}

      {loading && (
        <div className="merchant-popup">
          <div className="popup-content">
            <p>Loading...</p>
          </div>
        </div>
      )}
      
      {showPopup && (
        <div className="merchant-popup">
          <div className="popup-content">
            <p>{message}</p>
            <button 
              onClick={() => setShowPopup(false)}
              className="submit-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Merchant;