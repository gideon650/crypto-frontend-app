import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from 'moment-timezone';
import "./Swap.css";

const Swap = () => {
    const [assets, setAssets] = useState([]);
    const [swapAmount, setSwapAmount] = useState("");
    const [swapFromAsset, setSwapFromAsset] = useState("USDT");
    const [swapToAsset, setSwapToAsset] = useState("");
    const [swapBackAsset, setSwapBackAsset] = useState("USDT");
    const [swapBackTime, setSwapBackTime] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeError, setTimeError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [hasPendingSwap, setHasPendingSwap] = useState(false);
    const [currentLagosTime, setCurrentLagosTime] = useState("");
    const [amountError, setAmountError] = useState(false);

    const dropdownRef = useRef(null);
    const usdtAsset = assets.find(asset => asset.symbol === "USDT");
    const MINIMUM_SWAP_AMOUNT = 3;

    useEffect(() => {
        fetchAssets();
        checkPendingSwap();
        updateCurrentLagosTime();
        
        // Update Lagos time every minute
        const timeInterval = setInterval(updateCurrentLagosTime, 60000);
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            clearInterval(timeInterval);
        };
    }, []);

    // Display current Lagos time to help users understand the timezone
    const updateCurrentLagosTime = () => {
        const lagosTime = moment().tz('Africa/Lagos').format('YYYY-MM-DD HH:mm:ss');
        setCurrentLagosTime(lagosTime);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    };

    const fetchAssets = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/crypto-prices/`, {
                headers: { Authorization: `Token ${token}` },
            });
            setAssets(response.data.cryptocurrencies);
            const usdt = response.data.cryptocurrencies.find(asset => asset.symbol === "USDT");
            if (usdt) {
                setSwapFromAsset("USDT");
                setSwapBackAsset("USDT");
            }
        } catch (error) {
            console.error("Failed to fetch assets", error);
            setMessage("Failed to load assets. Please try again later.");
        }
    };

    const checkPendingSwap = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/check-pending-swap/`, {
                headers: { Authorization: `Token ${token}` },
            });
            setHasPendingSwap(response.data.has_pending_swap);
        } catch (error) {
            console.error("Error checking pending swap:", error);
        }
    };

    const handleSwapBackTimeChange = (e) => {
        const selectedTime = e.target.value;
        setSwapBackTime(selectedTime);
        
        if (!selectedTime) {
            setTimeError("");
            return;
        }

        // Get local input datetime and convert to moment
        const localMoment = moment(selectedTime);
        
        // Get current Lagos time
        const now = moment().tz('Africa/Lagos');
        
        // Calculate duration difference in minutes
        const diffMinutes = localMoment.diff(now, 'minutes');
        
        let error = "";
        if (diffMinutes <= 0) {
            error = "Swap back time must be in the future.";
        } else if (diffMinutes < 5) {
            error = "Swap duration must be at least 5 minutes.";
        } else if (diffMinutes > 43200) {
            error = "Swap duration cannot exceed 30 days.";
        }
        
        setTimeError(error);
    };

    // Improved swap amount change handler with proper validation
    const handleSwapAmountChange = (e) => {
        const value = e.target.value;
        setSwapAmount(value);
        
        // Validate amount
        if (!value || value === '') {
            setAmountError(false);
            return;
        }
        
        const amount = parseFloat(value);
        if (isNaN(amount) || amount <= 0) {
            setAmountError(true);
        } else if (amount < MINIMUM_SWAP_AMOUNT) {
            setAmountError(true);
        } else {
            setAmountError(false);
        }
    };

    // Helper function to get current error message
    const getAmountErrorMessage = () => {
        if (!swapAmount || !amountError) return "";
        
        const amount = parseFloat(swapAmount);
        if (isNaN(amount) || amount <= 0) {
            return "Swap amount must be greater than zero.";
        } else if (amount < MINIMUM_SWAP_AMOUNT) {
            return `Minimum swap amount is ${MINIMUM_SWAP_AMOUNT}`;
        }
        return "";
    };

    const getAssetId = (symbol) => {
        const asset = assets.find((a) => a.symbol === symbol);
        return asset ? asset.id : null;
    };

    const handleSwap = async () => {
        const missingFields = [];
        if (!swapAmount) missingFields.push("Swap Amount");
        if (!swapToAsset) missingFields.push("Swap To Asset");
        if (!swapBackTime) missingFields.push("Swap Back Time");
        
        if (missingFields.length > 0) {
            setMessage(`Please fill in all fields: ${missingFields.join(", ")}`);
            return;
        }

        // Check if there are any validation errors
        if (amountError) {
            setMessage(getAmountErrorMessage());
            return;
        }

        if (timeError) {
            setMessage(timeError);
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            
            // Convert input datetime to ISO format in user's local timezone
            // The backend will handle the conversion to Lagos time
            const swapBackTimeISO = moment(swapBackTime).format('YYYY-MM-DDTHH:mm:ss');
            
            const payload = {
                from_asset: getAssetId(swapFromAsset),
                to_asset: getAssetId(swapToAsset),
                swap_amount: swapAmount,
                swap_back_asset: getAssetId(swapBackAsset),
                swap_back_time: swapBackTimeISO
            };

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/swap-tokens/`,
                payload,
                { headers: { Authorization: `Token ${token}` } }
            );
            
            setMessage(response.data.message);
            checkPendingSwap();
            setSwapAmount("");
            setSwapToAsset("");
            setSearchQuery("");
            setSwapBackTime("");
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Swap failed. Please try again.";
            setMessage(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toAssetOptions = assets.filter(asset => asset.symbol !== "USDT");
    const filteredAssets = toAssetOptions.filter(asset => {
        const query = searchQuery.toLowerCase();
        return asset.name.toLowerCase().includes(query) || 
               asset.symbol.toLowerCase().includes(query);
    });

    const handleAssetSelect = (symbol) => {
        setSwapToAsset(symbol);
        setShowDropdown(false);
    };

    // Calculate minimum and maximum dates for the datetime-local input
    const getMinDateTime = () => {
        return moment().format("YYYY-MM-DDTHH:mm");
    };
    
    const getMaxDateTime = () => {
        return moment().add(30, 'days').format("YYYY-MM-DDTHH:mm");
    };

    return (
        <div className="swap-container">
            <h3>SWAP TOKEN</h3>
            
            <div className="info-box">
                <p>Swap from USDT to a different token and swap back to USDT at a scheduled time automatically.</p>
                <p className="timezone-note">Current time (Africa/Lagos): {currentLagosTime}</p>
            </div>
            
            <input
                type="number"
                placeholder="Enter Amount"
                value={swapAmount}
                onChange={handleSwapAmountChange}
                disabled={isSubmitting}
                min={MINIMUM_SWAP_AMOUNT}
                step="0.01"
            />
            {amountError && swapAmount && (
                <p className="error-message" style={{ color: 'red', marginTop: '5px' }}>
                    {getAmountErrorMessage()}
                </p>
            )}
            
            <div className="input-group">
                <label>Swap from:</label>
                <input 
                    type="text" 
                    value={usdtAsset ? `${usdtAsset.name} (USDT)` : "USDT"} 
                    disabled={true}
                    className="disabled-input"
                />
            </div>
            
            <div className="input-group token-search-container">
                <label>Swap to:</label>
                <div className="search-dropdown-container" ref={dropdownRef}>
                    <input
                        type="text"
                        placeholder="Search for token..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        disabled={isSubmitting}
                    />
                    
                    {swapToAsset && (
                        <div className="selected-token">
                            Selected: {assets.find(a => a.symbol === swapToAsset)?.name} ({swapToAsset})
                        </div>
                    )}
                    
                    {showDropdown && filteredAssets.length > 0 && (
                        <div className="token-dropdown">
                            {filteredAssets.map((asset) => (
                                <div 
                                    key={asset.id} 
                                    className="token-option"
                                    onClick={() => handleAssetSelect(asset.symbol)}
                                >
                                    <span className="token-name">{asset.name}</span>
                                    <span className="token-symbol">{asset.symbol}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {showDropdown && searchQuery && filteredAssets.length === 0 && (
                        <div className="no-results">No tokens found matching "{searchQuery}"</div>
                    )}
                </div>
            </div>
            
            <div className="input-group">
                <label>Swap Back:</label>
                <input 
                    type="text" 
                    value={usdtAsset ? `${usdtAsset.name} (USDT)` : "USDT"} 
                    disabled={true}
                    className="disabled-input"
                />
            </div>
            
            <div className="input-group">
                <label>Duration:</label>
                <input
                    type="datetime-local"
                    placeholder="Swap back time"
                    value={swapBackTime}
                    onChange={handleSwapBackTimeChange}
                    disabled={isSubmitting}
                    min={getMinDateTime()}
                    max={getMaxDateTime()}
                />
                {timeError && <p className="error-message" style={{ color: 'red' }}>{timeError}</p>}
                <p className="helper-text">Must be between 5 minutes and 30 days from now (Africa/Lagos time)</p>
            </div>
            
            <button
                className="circle-swap-btn"
                onClick={handleSwap}
                disabled={
                    isSubmitting || 
                    timeError || 
                    !swapToAsset || 
                    (amountError && swapAmount) || // Only disable if there's an error AND user has entered something
                    !swapAmount // Also disable if no amount is entered
                }
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 16L3 12M3 12L7 8M3 12H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 8L21 12M21 12L17 16M21 12H3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isSubmitting && <span className="loading-text">...</span>}
            </button>
            
            {message && (
                <p 
                    className={
                        message.includes("successfully") ? 
                        "success-message" : 
                        "error-message"
                    }
                    style={{ color: message.includes("successfully") ? '' : 'red' }}
                >
                    {message}
                </p>
            )}
            {hasPendingSwap && (
                <p className="status-info">
                    You have pending swap requests. New requests will be processed as long as you have sufficient balance.
                </p>
            )}
        </div>
    );
};

export default Swap;
