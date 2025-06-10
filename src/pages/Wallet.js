import React, { useState, useEffect } from "react";
import axios from "axios";
import BEP20QR from '../assets/images/BEP20.png';  // Adjust path as needed
import TRC20QR from '../assets/images/TRC20.png';
import SOLQR from '../assets/images/SOL.png';
import ERC20QR from '../assets/images/ERC20.png';
import "./Wallet.css";

const Wallet = () => {
  const [tab, setTab] = useState("deposit"); // 'deposit', 'withdraw', or 'history'
  const [depositMethod, setDepositMethod] = useState(""); // 'naira' or 'crypto'
  const [withdrawMethod, setWithdrawMethod] = useState(""); // 'naira', 'usdt', 'internal', 'onchain'
  const [cryptoOption, setCryptoOption] = useState(""); // 'alreadyHave' or 'buy'
  const [depositCryptoType, setDepositCryptoType] = useState(""); // 'alreadyHave' or 'viaBuybit'
  const [network, setNetwork] = useState(""); // For on-chain deposit
  const [chain, setChain] = useState(""); // For on-chain withdrawal
  const [transactionId, setTransactionId] = useState("");
  const [trades, setTrades] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState("");
  const [showBuyTrades, setShowBuyTrades] = useState(true);
  const [showSellTrades, setShowSellTrades] = useState(true);
  const [bankAccount, setBankAccount] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bybitEmail, setBybitEmail] = useState("");
  const [internalWalletId, setInternalWalletId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [message, setMessage] = useState("");
  const [usdToNgn, setUsdToNgn] = useState(1500); // Default/fallback rate
  const [userBalance, setUserBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [referralCode, setReferralCode] = useState("");
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showBankNotAvailable, setShowBankNotAvailable] = useState(false);
  const [showDeposits, setShowDeposits] = useState(true);
  const [showWithdrawals, setShowWithdrawals] = useState(true);
  const [amountError, setAmountError] = useState(false);
  
  const MINIMUM_AMOUNT = 3; // Minimum allowed amount in dollars

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Star rating logic
  const getStarRating = (balance) => {
    if (balance >= 5000) return "⭐⭐⭐⭐⭐";
    if (balance >= 1000) return "⭐⭐⭐⭐";
    if (balance >= 301) return "⭐⭐⭐";
    if (balance >= 101) return "⭐⭐";
    return "⭐";
  };

  // Network-specific wallet addresses
  const networkAddresses = {
    BSC: "0xBE64FcDFb202BddFFcfB0d3eFFAbD2E87C6680B9",
    TRC20: "TEHiejHxpS6gogLfbcQYy5Bew8qUy3DYt8",
    SOL: "9QNKBSSxKK583F7dW2wezzfA6zWQciuSMDaQctc1pSKY",
    ERC20: "0xBE64FcDFb202BddFFcfB0d3eFFAbD2E87C6680B9"
  };

  const networkQRCodes = {
    BSC: BEP20QR,
    TRC20: TRC20QR,
    SOL: SOLQR,
    ERC20: ERC20QR
  };

  const bybitWalletEmail = "395552798"; 

  // Fetch user balance, transactions, and referral info on component mount
  useEffect(() => {
    fetchAllUserData();
  }, []);
  
  const fetchAllUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };

      // Fetch user balance and referral code
      const portfolioResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/portfolio/`, 
          config
      );
      setUserBalance(portfolioResponse.data.balance_usd);
      
      // Add specific referral code API call
      const referralResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/referral-code/`, 
          config
      );
      
      // Update both referral code and stats
      if (referralResponse.data) {
          setReferralCode(referralResponse.data.referral_code);
          setReferralStats(referralResponse.data.stats);
      }
    
      // Fetch transactions from the new endpoint
      const transactionsResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/transactions/`, config);

      // Normalize trades data
      const trades = (transactionsResponse.data.trades || []).map(tx => ({
          id: tx.id,
          trade_type: tx.trade_type,
          quantity: tx.quantity,
          asset__symbol: tx.asset__symbol,
          status: "COMPLETED",
          timestamp: tx.timestamp,
      }));

      // Normalize deposits data
      const deposits = (transactionsResponse.data.deposits || []).map(tx => ({
          id: tx.id,
          type: "Deposit",
          amount: tx.amount,
          method: tx.method,
          status: tx.status,
          created_at: tx.created_at || tx.timestamp,
      }));

      // Normalize and format withdrawals data with proper method display
      const withdrawals = (transactionsResponse.data.withdrawals || []).map(tx => {
          let displayMethod = tx.display_method || tx.method;
          let recipientDetails = tx.recipient_details || tx.to_address;

          // Ensure we have properly formatted information for withdrawals if the backend didn't provide it
          if (!tx.display_method) {
              // Format display based on method
              switch(tx.method) {
                  case 'INTERNAL':
                      displayMethod = 'Internal Transfer';
                      recipientDetails = `Account: ${tx.to_address}`;
                      break;
                  case 'BANK':
                      displayMethod = 'Bank Transfer';
                      if (tx.to_address) {
                          try {
                              const bankDetails = JSON.parse(tx.to_address);
                              recipientDetails = `${bankDetails.bank_name} - ${bankDetails.account_number}`;
                          } catch {
                              recipientDetails = tx.to_address;
                          }
                      }
                      break;
                  case 'BYBIT':
                      displayMethod = 'Bybit';
                      recipientDetails = `UID: ${tx.to_address}`;
                      break;
                  case 'ON_CHAIN':
                      displayMethod = 'On-Chain';
                      recipientDetails = tx.chain ? `${tx.to_address} (${tx.chain})` : tx.to_address;
                      break;
              }
          }

          return {
              id: tx.id,
              type: "Withdrawal",
              amount: tx.amount,
              method: tx.method,
              display_method: displayMethod,
              recipient_details: recipientDetails,
              status: tx.status,
              created_at: tx.created_at || tx.timestamp,
              chain: tx.chain,
              to_address: tx.to_address
          };
      });

      // Combine and sort by date (descending)
      const allTransactions = [...trades, ...deposits, ...withdrawals].sort(
          (a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp)
      );
    
      setTrades(trades);
      setDeposits(deposits);
      setWithdrawals(withdrawals);
      setTransactions(allTransactions);
      setMessage("");
    } catch (error) {
      console.error("Transactions fetch error:", error);
      setMessage("Failed to load transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };
 
  // Update the useEffect for account numbers to include bank names
  useEffect(() => {
  const accountNumbers = ["8022329289", "2143459556", "5022913315"];
  const bankNames = ["Palmpay", "UBA", "Moniepoint"];
  
  const updateAccountNumber = () => {
    // Calculate which account number to show based on current time (30-minute intervals)
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const intervalIndex = Math.floor(totalMinutes / 30) % 3;
    
    setBankAccountNumber(accountNumbers[intervalIndex]);
    setBankName(bankNames[intervalIndex]);
  };
  
  // Set initial account number
  updateAccountNumber();
  
  // Update the account number every 30 minutes
  const interval = setInterval(updateAccountNumber, 30 * 60 * 1000); // 30 minutes in milliseconds
  
  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn");
        setUsdToNgn(res.data.tether.ngn); // <-- FIXED HERE
      } catch (err) {
        setMessage("Failed to fetch exchange rate. Please try again later.");
      }
    };
    fetchRate();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage("Copied to clipboard!");
    setTimeout(() => setMessage(""), 2000);
  };

  // Get CSRF token for non-axios requests
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Method mapping for API format
  const mapMethodToApiFormat = (method) => {
    const methodMapping = {
      'naira': 'BANK_TRANSFER',
      'crypto': depositCryptoType === "viaBuybit" ? 'BYBIT' : 'ON_CHAIN',
      'usdt': 'BYBIT',
      'BYBIT': 'BYBIT',
      'INTERNAL': 'INTERNAL',
      'ON_CHAIN': 'ON_CHAIN',
      'BANK': 'BANK'
    };
    return methodMapping[method] || method;
  };

  const nairaValue =
    amount && usdToNgn
      ? (parseFloat(amount) * usdToNgn).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "";

  const validateForm = () => {
    // Check minimum amount first
    if (amount === "" || parseFloat(amount) < MINIMUM_AMOUNT) {
      setAmountError(true);
      setMessage(`Minimum ${tab === "deposit" ? "deposit" : "withdrawal"} amount is $${MINIMUM_AMOUNT}`);
      return false;
    } else {
      setAmountError(false);
    }
    
    if (tab === "withdraw" && parseFloat(amount) > userBalance) {
      setMessage("Insufficient balance for this withdrawal");
      return false;
    }
    
    if (amount === "" || parseFloat(amount) <= 0) {
      setMessage("Please enter a valid amount");
      return false;
    }
    
    if (tab === "deposit" && depositMethod === "crypto" && transactionId === "") {
      setMessage("Transaction ID is required");
      return false;
    }
    
    // Enhanced validation for withdraw methods
    if (tab === "withdraw") {
      switch (withdrawMethod) {
        case "naira":
        case "BANK":
          if (bankAccount === "" || bankName === "" || accountName === "") {
            setMessage("All bank details are required");
            return false;
          }
          break;
        case "usdt":
        case "BYBIT":
          if (bybitEmail === "") {
            setMessage("Bybit email is required");
            return false;
          }
          break;
        case "INTERNAL":
          if (internalWalletId === "") {
            setMessage("Internal wallet ID is required");
            return false;
          }
          break;
        case "ON_CHAIN":
          if (walletAddress === "" || chain === "") {
            setMessage("Wallet address and chain selection are required");
            return false;
          }
          break;
        default:
          setMessage("Please select a withdrawal method");
          return false;
      }
    }
    
    return true;
  };

  const submitTransaction = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };

      let requestData = {};
      let url = "";

      if (tab === "deposit") {
        url = `${API_BASE_URL}/deposit/`;
        if (depositMethod === "crypto") {
          requestData = {
            method: mapMethodToApiFormat(depositMethod),
            crypto_type: depositCryptoType,
            transaction_id: transactionId,
            amount: parseFloat(amount),
            ...(depositCryptoType === "onchain" && { network }),
          };
        } else {
          requestData = {
            method: mapMethodToApiFormat(depositMethod),
            transaction_id: transactionId,
            amount: parseFloat(amount) 
          };
        }
      } else {
        url = `${API_BASE_URL}/withdraw/`;
        const apiWithdrawMethod = mapMethodToApiFormat(withdrawMethod);
        requestData = {
          method: apiWithdrawMethod,
          amount: parseFloat(amount)
        };
        switch (apiWithdrawMethod) {
          case "BANK":
            requestData.account_name = accountName;
            requestData.account_number = bankAccount;
            requestData.bank_name = bankName;
            break;
          case "BYBIT":
            requestData.email = bybitEmail;
            break;
          case "INTERNAL":
            requestData.account_number = internalWalletId;
            break;
          case "ON_CHAIN":
            requestData.wallet_address = walletAddress;
            requestData.chain = chain;
            break;
        }
      }

      const response = await axios.post(url, requestData, config);
    
      if (response.data.status === "success") {
        setMessage(response.data.message || "Request submitted successfully!");
      } else {
        // If the API returns an error message, use that
        setMessage(response.data.message || response.data.error || "Request could not be processed");
      }
    } catch (error) {
      // Improved error handling
      let errorMessage = "Something went wrong";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.status) {
          errorMessage = errorData.status;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something happened in setting up the request
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    
    // Check if amount is less than minimum
    if (value && parseFloat(value) < MINIMUM_AMOUNT) {
      setAmountError(true);
    } else {
      setAmountError(false);
    }
  };

  const handleDepositMethodChange = (method) => {
    setDepositMethod(method);
    setDepositCryptoType("");
    setNetwork("");
    setShowQRCode(false);
  };
  
  const handleWithdrawMethodChange = (method) => {
    setWithdrawMethod(method);
    setAmount("");
    setBankAccount("");
    setBankName("");
    setAccountName("");
    setBybitEmail("");
    setInternalWalletId("");
    setWalletAddress("");
    setChain("");
    setAmountError(false);
  };

  const handleNetworkSelect = (selectedNetwork) => {
    setNetwork(selectedNetwork);
    setShowQRCode(true);
  };

  const handleBackToNetworks = () => {
    setShowQRCode(false);
  };

  const saveQRCodeImage = () => {
    setMessage("QR Code image saved!");
    setTimeout(() => setMessage(""), 2000);
  };

  // Star rating UI
  const renderStarRating = () => (
    <div className="wallet-star-rating" style={{ margin: "10px 0", fontSize: "20px", fontWeight: "bold", textAlign: "center" }}>
      {getStarRating(userBalance)}
    </div>
  );

  // Bank withdrawal popup
  const renderBankNotAvailablePopup = () => (
    showBankNotAvailable && (
      <div className="wallet-popup-overlay">
        <div className="wallet-popup">
          <h3>Notice</h3>
          <p>This is not available in your country.</p>
          <button className="submit-button" onClick={() => setShowBankNotAvailable(false)}>OK</button>
        </div>
      </div>
    )
  );

  // Add this to your component right before the return statement
  const renderMessagePopup = () => {
    if (!message) return null;
    
    // Check if message is an object (like the error response from API)
    let displayMessage = message;
    if (typeof message === 'object') {
      // Handle API error responses
      if (message.message) {
        displayMessage = message.message;
      } else if (message.error) {
        displayMessage = message.error;
      } else {
        displayMessage = JSON.stringify(message);
      }
    }
    
    // Determine if it's an error (red) or success (green)
    const isError = typeof displayMessage === 'string' && (
      displayMessage.toLowerCase().includes('error') || 
      displayMessage.toLowerCase().includes('fail') || 
      displayMessage.toLowerCase().includes('already exists') ||
      displayMessage.toLowerCase().includes('insufficient') ||
      displayMessage.toLowerCase().includes('minimum')
    );
    
    const statusClass = isError ? 'error' : 'success';
    const statusTitle = isError ? 'Error' : 'Success';
    
    return (
      <div className="wallet-popup-overlay">
        <div className={`wallet-popup ${statusClass}`}>
          <h3>{statusTitle}</h3>
          <p>{displayMessage}</p>
          <button 
            className="submit-button" 
            onClick={() => {
              setMessage("");
              if (!isError) {
                // Reset form fields only on success
                setTransactionId("");
                setAmount("");
                setBankAccount("");
                setBankName("");
                setAccountName("");
                setBybitEmail("");
                setInternalWalletId("");
                setWalletAddress("");
                setChain("");
                fetchAllUserData();
              }
            }}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  const renderQRCodeView = () => {
    const currentAddress = networkAddresses[network];
    const currentQRCode = networkQRCodes[network];
    
    return (
      <div className="qrcode-deposit-view">
        <div className="qrcode-header">
          <button onClick={handleBackToNetworks} className="back-button">
            ← Back
          </button>
          <div className="network-info">
            Network: <span className="network-name">{network}</span>
          </div>
        </div>
        
        <div className="qrcode-container">
          <div className="qrcode-image">
            <img 
              src={currentQRCode}
              alt={`${network} QR Code`}
              style={{
                width: '200px',
                height: '200px',
                display: 'block',
                margin: '0 auto',
                borderRadius: '8px',
                border: '2px solid #800080'
              }}
            />
          </div>
        </div>
        
        <div className="wallet-address-container">
          <h3>Wallet Address</h3>
          <div className="copy-address-box">
            <span className="address-text">{currentAddress}</span>
            <button 
              onClick={() => copyToClipboard(currentAddress)}
              className="copy-address-button"
            >
              Copy Address
            </button>
          </div>
        </div>
        
        <div className="withdraw-field-group">
          <h3>Confirm Your Deposit</h3>
          <div className="form-group">
            <label>Amount (USDT)</label>
            <input 
              type="number" 
              placeholder="Enter deposit amount" 
              value={amount} 
              onChange={handleAmountChange} 
            />
            {amountError && (
              <div className="amount-error-message">
                Minimum deposit amount is ${MINIMUM_AMOUNT}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Transaction ID</label>
            <input 
              type="text" 
              placeholder="Enter transaction ID" 
              value={transactionId} 
              onChange={(e) => setTransactionId(e.target.value)} 
            />
          </div>
          <button className="submit-button" onClick={submitTransaction} disabled={loading || amountError}>
            {loading ? "Processing..." : "Confirm Deposit"}
          </button>
        </div>
        
        <div className="deposit-warning">
          <p>Please make sure that your transaction id is correct. Otherwise, your deposited funds will not be added to your available balance — nor will it be refunded.</p>
          <p><strong>Important:</strong> After making your deposit, you MUST submit your transaction hash above for verification.</p>
        </div>
        
      </div>
    );
  };

  const renderDepositInterface = () => {
    return (
      <div className="deposit-section">       
        <div className="selection-container">
          <h8 className="section-heading">Select deposit method</h8>
          <div className="deposit-method-buttons">
            <button 
              onClick={() => handleDepositMethodChange("naira")} 
              className={depositMethod === "naira" ? "active-button" : ""}
            >
              Deposit p2p
            </button>
            <button 
              onClick={() => handleDepositMethodChange("crypto")} 
              className={depositMethod === "crypto" ? "active-button" : ""}
            >
              Deposit Crypto
            </button>
          </div>
        </div>
  
        {depositMethod === "crypto" && (
          <div className="crypto-deposit-options">
            <h8>Deposit crypto</h8>
            <div className="method-buttons">
              <button 
                onClick={() => setDepositCryptoType("viaBuybit")}
                className={depositCryptoType === "viaBuybit" ? "active-button" : ""}>
                Via Bybit
              </button>
              <button 
                onClick={() => setDepositCryptoType("onchain")}
                className={depositCryptoType === "onchain" ? "active-button" : ""}>
                On-chain Deposit
              </button>
            </div>
          </div>
        )}
  
        {depositMethod === "crypto" && depositCryptoType === "viaBuybit" && (
          <div className="deposit-form">
            <div className="form-group">
              <p>USDT</p>
              <div className="copy-box">
                {bybitWalletEmail} <button onClick={() => copyToClipboard(bybitWalletEmail)}>Copy</button>
              </div>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input 
                type="number" 
                placeholder="Enter quantity (USDT)" 
                value={amount} 
                onChange={handleAmountChange} 
              />
              {amountError && (
                <div className="amount-error-message">
                  Minimum deposit amount is ${MINIMUM_AMOUNT}
                </div>
              )}
              {amount && !amountError && (
                <div style={{ marginTop: 8, color: "#008000" }}>
                  ≈ ₦{nairaValue} NGN
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Transaction ID</label>
              <input 
                type="text" 
                placeholder="Enter transaction ID" 
                value={transactionId} 
                onChange={(e) => setTransactionId(e.target.value)} 
              />
            </div>
            <button className="submit-button" onClick={submitTransaction} disabled={loading || amountError}>
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        )}
  
        {depositMethod === "crypto" && depositCryptoType === "onchain" && !showQRCode && (
          <div className="deposit-form">
            <div className="form-group">
              <label>Amount (USDT)</label>
              <input 
                type="number" 
                placeholder="Enter deposit amount" 
                value={amount} 
                onChange={handleAmountChange} 
              />
              {amountError && (
                <div className="amount-error-message">
                  Minimum deposit amount is ${MINIMUM_AMOUNT}
                </div>
              )}
              {amount && !amountError && (
                <div style={{ marginTop: 8, color: "#008000" }}>
                  ≈ ₦{nairaValue} NGN
                </div>
              )}
            </div>
            <div className="form-group">
              <label>USDT</label>
              <button 
                className="full-width-button" 
                onClick={() => setNetwork("select")}
              >
                Select Network
              </button>
            </div>
            {network === "select" && (
              <>
                <div className="form-group">
                  <label>Network Options</label>
                  <div className="method-buttons">
                    <button onClick={() => handleNetworkSelect("TRC20")}>TRC20</button>
                    <button onClick={() => handleNetworkSelect("ERC20")}>ERC20</button>
                    <button onClick={() => handleNetworkSelect("BSC")}>BEP20</button>
                    <button onClick={() => handleNetworkSelect("SOL")}>SOL</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
  
        {depositMethod === "crypto" && depositCryptoType === "onchain" && showQRCode && (
          renderQRCodeView()
        )}
  
        {depositMethod === "naira" && (
          <div className="deposit-form">
            {/* Amount input at the top */}
            <div className="form-group">
              <label>Amount</label>
              <input 
                type="number" 
                placeholder="Enter deposit amount" 
                value={amount} 
                onChange={handleAmountChange} 
              />
              {amountError && (
                <div className="amount-error-message">
                  Minimum deposit amount is ${MINIMUM_AMOUNT}
                </div>
              )}
              {amount && !amountError && (
                <div style={{ marginTop: 8, color: "#008000" }}>
                  ≈ ₦{nairaValue} NGN
                </div>
              )}
            </div>
            {/* Transparent purple info box, purple text, centralized account number */}
            <div
              style={{
                background: "rgba(128,0,128,0.10)",
                borderRadius: "14px",
                padding: "1.7rem 1.2rem",
                margin: "1.2rem 0",
                border: "2px solid #800080",
                color: "white",
                boxShadow: "0 4px 16px rgba(128,0,128,0.10)",
                fontFamily: "inherit",
                textAlign: "center"
              }}
            >
              <div style={{ marginBottom: "1.1rem", fontWeight: 300, fontSize: "0.8rem", lineHeight: 1.7 }}>
                1. <span style={{ color: "white" }}>Please be advised</span> that the seller's assets shall be frozen upon initiation and successful completion of the transaction.<br />
                2. Please ensure that the name in your <span style={{ color: "#800080" }}>SWAPVIEW</span> account matches with the payment account name.<br />
                3. Please also ensure you use your full name as the bank narration.
              </div>
              <div style={{ marginBottom: "0.7rem", fontWeight: 500 }}>
                <b>Transfer {amount && nairaValue && !amountError ? `₦${nairaValue}` : ""} to:</b>
              </div>
              <div style={{
                fontSize: "1.7rem",
                fontWeight: "bold",
                marginBottom: "0.35rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                color: "#800080"
              }}>
                <span
                  style={{
                    cursor: "pointer",
                    color: "#800080",
                    letterSpacing: "2px",
                    userSelect: "all",
                    fontSize: "2rem",
                    background: "rgba(128,0,128,0.07)",
                    borderRadius: "8px",
                    padding: "8px 24px",
                    margin: "0 auto"
                  }}
                  onClick={() => copyToClipboard(bankAccountNumber)}
                  title="Copy account number"
                >
                  {bankAccountNumber}
                </span>
                <button
                  onClick={() => copyToClipboard(bankAccountNumber)}
                  style={{
                    background: "#800080",
                    border: "none",
                    borderRadius: "6px",
                    color: "#fff",
                    padding: "6px 20px",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "1rem",
                    marginTop: "10px",
                    transition: "background 0.2s",
                    width: "auto",
                    minWidth: "100px",
                    '@media (max-width: 767px)': {
                      minWidth: "70px",
                      padding: "4px 10px",
                      fontSize: "0.8rem"
                    }
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "#a020a0"}
                  onMouseOut={e => e.currentTarget.style.background = "#800080"}
                >
                  Copy
                </button>
              </div>
              <div style={{ marginBottom: "0.5rem", color: "#800080", fontWeight: 500, fontSize: "1.1rem" }}>
                {bankName}
              </div>
              <div>
                {renderStarRating()}
              </div>
            </div>
            {/* Transaction ID field under the info box */}
            <div className="form-group">
              <label>Transaction ID</label>
              <input 
                type="text" 
                placeholder="Enter transaction ID" 
                value={transactionId} 
                onChange={(e) => setTransactionId(e.target.value)} 
              />
            </div>
            <button className="submit-button" onClick={submitTransaction} disabled={loading || amountError}>
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        )}
        
      </div>
    );
  };

  const renderWithdrawInterface = () => {
    return (
      <div className="withdraw-section">
        <h8 className="section-heading">Select Withdrawal Method</h8>
        <div className="method-buttons">
          <button 
            onClick={() => handleWithdrawMethodChange("INTERNAL")}
            className={withdrawMethod === "INTERNAL" ? "active-button" : ""}>
            Internal Transfer
          </button>
          <button 
            onClick={() => handleWithdrawMethodChange("BYBIT")}
            className={withdrawMethod === "BYBIT" || withdrawMethod === "usdt" ? "active-button" : ""}>
            Bybit UID
          </button>
          <button 
            onClick={() => handleWithdrawMethodChange("ON_CHAIN")}
            className={withdrawMethod === "ON_CHAIN" ? "active-button" : ""}>
            On-Chain Transfer
          </button>
          <button 
            onClick={() => handleWithdrawMethodChange("BANK")}
            className={withdrawMethod === "BANK" || withdrawMethod === "naira" ? "active-button" : ""}>
            p2p
          </button>
        </div>
  
        {withdrawMethod && (
          <div className="withdraw-form">
            <div className="form-group">
              <label>Amount</label>
              <input 
                type="number" 
                placeholder="Amount" 
                value={amount} 
                onChange={handleAmountChange} 
              />
              {amountError && (
                <div className="amount-error-message">
                  Minimum withdrawal amount is ${MINIMUM_AMOUNT}
                </div>
              )}
              {parseFloat(amount) > userBalance && (
                <p className="error-text">Insufficient balance</p>
              )}
            </div>
            
            {(withdrawMethod === "INTERNAL") && (
              <div className="withdraw-field-group" id="internal-fields">
                <div className="form-group">
                  <label>Address</label>
                  <input 
                    type="text" 
                    placeholder="Recipient address" 
                    value={internalWalletId}
                    onChange={(e) => setInternalWalletId(e.target.value)} 
                  />
                </div>
              </div>
            )}
            
            {(withdrawMethod === "BYBIT" || withdrawMethod === "usdt") && (
              <div className="withdraw-field-group" id="bybit-fields">
                <div className="form-group">
                  <label>Bybit UID</label>
                  <input 
                    type="email" 
                    placeholder="Bybit UID" 
                    value={bybitEmail}
                    onChange={(e) => setBybitEmail(e.target.value)} 
                  />
                </div>
              </div>
            )}
            
            {withdrawMethod === "ON_CHAIN" && (
              <div className="withdraw-field-group" id="onchain-fields">
                <div className="form-group">
                  <label>Wallet Address</label>
                  <input 
                    type="text" 
                    placeholder="Wallet Address" 
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>Chain</label>
                  <div className="network-selection-container">
                    {chain ? (
                      <div className="selected-network">
                        <span>Selected: {chain}</span>
                        <button 
                          className="change-network-btn"
                          onClick={() => setChain("")}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="network-grid">
                        {["TRC20", "ERC20", "BEP20", "SOL"].map((network) => (
                          <button
                            key={network}
                            className="network-grid-item"
                            onClick={() => setChain(network)}
                          >
                            {network}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
  
            {(withdrawMethod === "BANK" || withdrawMethod === "naira") && (
            <div className="withdraw-field-group" id="bank-fields">
              <div className="form-group">
                <label>Account Number</label>
                <input 
                  type="text" 
                  placeholder="Account Number" 
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Bank Name</label>
                <input 
                  type="text" 
                  placeholder="Bank Name" 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Account Name</label>
                <input 
                  type="text" 
                  placeholder="Account Name" 
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)} 
                />
              </div>
              
              {/* Add the footnote here, right after the account name input and before the closing div */}
              <div
                style={{
                  background: "rgba(128,0,128,0.10)",
                  borderRadius: "14px",
                  padding: "1.7rem 1.2rem",
                  margin: "1.2rem 0",
                  border: "2px solid #800080",
                  color: "white",
                  boxShadow: "0 4px 16px rgba(128,0,128,0.10)",
                  fontFamily: "inherit",
                  textAlign: "center"
                }}
              >
                <div style={{ marginBottom: "1.1rem", fontWeight: 300, fontSize: "0.8rem", lineHeight: 1.7 }}>
                  1. Please ensure the payment account details you provide match your <span style={{ color: "#800080" }}>SWAPVIEW</span> account name.<br />
                  2. You'll be matched with a buyer/merchant who will send funds to the provided details above.<br />
                  3. Incase of discrepancies or If funds isn't received after 24 hours, contact our support immediately.
                </div>
                <div>
                  {renderStarRating()}
                </div>
              </div>
            </div>
          )}
            
            <button 
              className="submit-button" 
              onClick={submitTransaction} 
              disabled={loading || parseFloat(amount) > userBalance || amountError}
            >
              {loading ? "Processing..." : "Submit Withdrawal"}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderTradeGroup = (type, trades, show, setShow) => (
    <div className="trade-group">
      <button
        className={`trade-group-toggle ${!show ? 'collapsed' : ''}`}
        onClick={() => setShow(!show)}
      >
        {type} Trades ({trades.length})
      </button>
      {show && trades.length > 0 && (
        <div className="transaction-table-container">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Quantity</th>
                <th>Token</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id}>
                  <td>{trade.trade_type}</td>
                  <td>{trade.quantity}</td>
                  <td>{trade.asset__symbol}</td>
                  <td>
                    <span className={`status-badge ${trade.status ? trade.status.toLowerCase() : 'completed'}`}>
                      {trade.status || 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {show && trades.length === 0 && <p>No {type.toLowerCase()} trades found.</p>}
    </div>
  );

  const renderTransactionHistory = () => {
    const buyTrades = trades.filter((trade) => trade.trade_type === "BUY");
    const sellTrades = trades.filter((trade) => trade.trade_type === "SELL");

    // Format date for mobile
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return window.innerWidth <= 767 ? 
        `${date.getDate()}/${date.getMonth()+1}` : 
        date.toLocaleDateString();
    };

    // Format amount for mobile
    const formatAmount = (amount) => {
      return window.innerWidth <= 767 ? 
        `$${parseFloat(amount).toFixed(0)}` : 
        `$${parseFloat(amount).toFixed(2)}`;
    };

    return (
      <div className="transaction-history">
        <h3 className="section-heading">Transaction History</h3>
        
        {/* Buy/Sell Trades Section */}
        <div className="trade-section">
          {renderTradeGroup("Buy", buyTrades, showBuyTrades, setShowBuyTrades)}
          {renderTradeGroup("Sell", sellTrades, showSellTrades, setShowSellTrades)}
        </div>

        {/* Deposits Section */}
        <div className="transaction-section">
          <button
            className={`trade-group-toggle ${!showDeposits ? 'collapsed' : ''}`}
            onClick={() => setShowDeposits(!showDeposits)}
          >
            Deposits ({deposits.length})
          </button>
          {showDeposits && deposits.length === 0 ? (
            <p className="no-transactions">No deposits found</p>
          ) : showDeposits && (
            <div className="transaction-table-container">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <tr key={deposit.id}>
                      <td>{formatDate(deposit.created_at)}</td>
                      <td>{formatAmount(deposit.amount)}</td>
                      <td>{deposit.method}</td>
                      <td>
                        <span className={`status-badge ${deposit.status.toLowerCase()}`}>
                          {window.innerWidth <= 767 ? 
                            deposit.status.substring(0, 3) : 
                            deposit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Withdrawals Section */}
        <div className="transaction-section">
          <button
            className={`trade-group-toggle ${!showWithdrawals ? 'collapsed' : ''}`}
            onClick={() => setShowWithdrawals(!showWithdrawals)}
          >
            Withdrawals ({withdrawals.length})
          </button>
          {showWithdrawals && withdrawals.length === 0 ? (
            <p className="no-transactions">No withdrawals found</p>
          ) : showWithdrawals && (
            <div className="transaction-table-container">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    {window.innerWidth > 767 && <th>Recipient</th>}
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id}>
                      <td>{formatDate(withdrawal.created_at || withdrawal.timestamp)}</td>
                      <td>{formatAmount(withdrawal.amount)}</td>
                      <td>
                        {window.innerWidth <= 767 ? 
                          (withdrawal.display_method || withdrawal.method).substring(0, 5) : 
                          (withdrawal.display_method || withdrawal.method)}
                      </td>
                      {window.innerWidth > 767 && (
                        <td>
                          {withdrawal.recipient_details || withdrawal.to_address || "N/A"}
                        </td>
                      )}
                      <td>
                        <span className={`status-badge ${withdrawal.status.toLowerCase()}`}>
                          {window.innerWidth <= 767 ? 
                            withdrawal.status.substring(0, 3) : 
                            withdrawal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReferralSystem = () => {
    return (
      <div className="referral-section">
        <h8 className="section-heading">Referral System</h8>
        <div className="referral-info">
          <p>Don't Miss Out - Unlock Your Invite Rewards Now!</p>
          <p>Invite just 3 friends and start earning 10% of their first deposit straight into your wallet</p>
          {referralCode ? (
            <div className="referral-code-box">
              <p>Your Referral Code:</p>
              <div className="copy-box">
                {referralCode} <button onClick={() => copyToClipboard(referralCode)}>Copy</button>
              </div>
            </div>
          ) : (
            <p>Loading your referral code...</p>
          )}
          {referralStats && (
            <div className="referral-stats">
              <h3>Your Referral Stats</h3>
              <p>Total Referrals: {referralStats.total}</p>
              <p>Funded Referrals: {referralStats.funded} / 3</p>
              {referralStats.funded >= 3 ? (
                referralStats.has_received_bonus ? (
                  <div className="bonus-received">
                    <p className="bonus-message">Your referral bonus has been paid!</p>
                    <p className="bonus-details">
                      Initial Deposit: ${referralStats.initial_deposit}<br/>
                      Bonus Amount: ${(referralStats.initial_deposit * 0.10).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="bonus-pending">
                    {referralStats.initial_deposit ? 
                      "Processing your referral bonus..." :
                      "Make your first deposit to receive your referral bonus!"}
                  </p>
                )
              ) : (
                <p>Refer {3 - referralStats.funded} more funded users to earn your bonus!</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="wallet-container">
      <h3>ASSET</h3>
      {/* Top Section: Balance, Star Rating */}
      <div className="wallet-balance-top" style={{ marginBottom: "30px" }}>
        <div className="balance-info" style={{ fontWeight: "bold", fontSize: "2rem", textAlign: "center" }}>
          {parseFloat(userBalance || 0).toFixed(2)} <span style={{ fontSize: "1rem" }}>USD</span>
        </div>
        {renderStarRating()}
      </div>
      <div className="wallet-tabs">
        <button
          onClick={() => setTab("deposit")}
          className={tab === "deposit" ? "active-tab" : ""}
        >
          Deposit
        </button>
        <button
          onClick={() => setTab("withdraw")}
          className={tab === "withdraw" ? "active-tab" : ""}
        >
          Withdraw
        </button>
        <button
          onClick={() => setTab("history")}
          className={tab === "history" ? "active-tab" : ""}
        >
          History
        </button>
        <button
          onClick={() => setTab("referral")}
          className={tab === "referral" ? "active-tab" : ""}
        >
          Invite
        </button>
      </div>
      {tab === "deposit" && renderDepositInterface()}
      {tab === "withdraw" && renderWithdrawInterface()}
      {tab === "history" && renderTransactionHistory()}
      {tab === "referral" && renderReferralSystem()}
      {renderBankNotAvailablePopup()}
      {renderMessagePopup()}
    </div>
  );
};

export default Wallet;
