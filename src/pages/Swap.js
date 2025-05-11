import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from 'moment-timezone';
import "./Swap.css";

const Swap = () => {
    const [assets, setAssets] = useState([]);
    const [swapAmount, setSwapAmount] = useState("");
    const [swapFromAsset, setSwapFromAsset] = useState("USDT");  // Default to USDT and lock it
    const [swapToAsset, setSwapToAsset] = useState("");
    const [swapBackAsset, setSwapBackAsset] = useState("USDT");  // Default to USDT and lock it
    const [swapBackTime, setSwapBackTime] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasPendingSwap, setHasPendingSwap] = useState(false);
    const [timeError, setTimeError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Reference to the dropdown container for click outside detection
    const dropdownRef = useRef(null);
    
    // Find USDT asset for validation
    const usdtAsset = assets.find(asset => asset.symbol === "USDT");

    useEffect(() => {
        fetchAssets();
        checkPendingSwap();
        
        // Add click event listener to handle clicks outside the dropdown
        document.addEventListener('mousedown', handleClickOutside);
        
        // Cleanup function to remove event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    // Handle clicks outside of the dropdown
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
            
            // Default selection for USDT
            const usdtAsset = response.data.cryptocurrencies.find(asset => asset.symbol === "USDT");
            if (usdtAsset) {
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

    const validateSwapTime = (selectedTime) => {
        const now = moment();
        const selected = moment(selectedTime);
        
        // Calculate duration in minutes
        const durationMinutes = selected.diff(now, 'minutes');
        
        if (durationMinutes <= 0) {
            return "Swap back time must be in the future.";
        }
        
        if (durationMinutes < 5) {
            return "Swap duration must be at least 5 minutes.";
        }
        
        if (durationMinutes > 43200) { // 30 days
            return "Swap duration cannot exceed 30 days.";
        }
        
        return ""; // No error
    };

    const handleSwapBackTimeChange = (e) => {
        const selectedTime = e.target.value;
        setSwapBackTime(selectedTime);
        
        const error = validateSwapTime(selectedTime);
        setTimeError(error);
    };

    const getAssetId = (symbol) => {
        const asset = assets.find((a) => a.symbol === symbol);
        return asset ? asset.id : null;
    };

    const handleSwap = async () => {
        // Validation checks
        const missingFields = [];
        if (!swapAmount) missingFields.push("Swap Amount");
        if (!swapFromAsset) missingFields.push("Swap From Asset");
        if (!swapToAsset) missingFields.push("Swap To Asset");
        if (!swapBackAsset) missingFields.push("Swap Back Asset");
        if (!swapBackTime) missingFields.push("Swap Back Time");
        
        if (missingFields.length > 0) {
            const errorMessage = `Please fill in all fields: ${missingFields.join(", ")}`;
            setMessage(errorMessage);
            return;
        }

        // Additional validations
        if (parseFloat(swapAmount) <= 0) {
            setMessage("Swap amount must be greater than zero.");
            return;
        }

        if (swapFromAsset === swapToAsset) {
            setMessage("Swap from and to assets must be different.");
            return;
        }
        
        // Validate from_asset is USDT
        if (swapFromAsset !== "USDT") {
            setMessage("Swap from asset must be USDT.");
            return;
        }
        
        // Validate swap_back_asset is USDT
        if (swapBackAsset !== "USDT") {
            setMessage("Swap back asset must be USDT.");
            return;
        }
        
        // Validate swap time
        const timeError = validateSwapTime(swapBackTime);
        if (timeError) {
            setMessage(timeError);
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            // Convert to Lagos timezone as specified in the backend
            const lagosTime = moment.utc(swapBackTime).tz('Africa/Lagos').format('YYYY-MM-DD HH:mm:ss');

            const payload = {
                from_asset: getAssetId(swapFromAsset),
                to_asset: getAssetId(swapToAsset),
                swap_amount: swapAmount,
                swap_back_asset: getAssetId(swapBackAsset),
                swap_back_time: lagosTime
            };

            console.log("Prepared Swap Payload:", payload);

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/swap-tokens/`,
                payload,
                { headers: { Authorization: `Token ${token}` } }
            );
            
            console.log("Swap Response:", response.data);
            setMessage(response.data.message);
            checkPendingSwap();
            
            // Clear form after successful submission
            setSwapAmount("");
            setSwapToAsset("");
            setSearchQuery("");
            setSwapBackTime("");
        } catch (error) {
            console.error("Full Error Object:", error);
            const errorMessage = error.response?.data?.error || "Swap failed. Please try again.";
            console.error("Swap Error Message:", errorMessage);
            setMessage(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter assets for dropdown (exclude USDT from to_asset)
    const toAssetOptions = assets.filter(asset => asset.symbol !== "USDT");
    
    // Filter assets based on search query
    const filteredAssets = toAssetOptions.filter(asset => {
        const query = searchQuery.toLowerCase();
        return asset.name.toLowerCase().includes(query) || 
               asset.symbol.toLowerCase().includes(query);
    });
    
    // Handle asset selection from the dropdown
    const handleAssetSelect = (symbol) => {
        setSwapToAsset(symbol);
        setShowDropdown(false);
    };

    return (
        <div className="swap-container">
            <h3>SWAP TOKEN</h3>
            
            <div className="info-box">
                <p>Swap from USDT to a different token and swap back to USDT at a scheduled time automatically.</p>
            </div>
            
            <input
                type="number"
                placeholder="Enter Amount"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                disabled={isSubmitting || hasPendingSwap}
            />
            
            {/* From Asset - Fixed to USDT */}
            <div className="input-group">
                <label>Swap from:</label>
                <input 
                    type="text" 
                    value={usdtAsset ? `${usdtAsset.name} (USDT)` : "USDT"} 
                    disabled={true}
                    className="disabled-input"
                />
            </div>
            
            {/* To Asset with Search Functionality */}
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
                        disabled={isSubmitting || hasPendingSwap}
                    />
                    
                    {/* Show selected token */}
                    {swapToAsset && (
                        <div className="selected-token">
                            Selected: {assets.find(a => a.symbol === swapToAsset)?.name} ({swapToAsset})
                        </div>
                    )}
                    
                    {/* Dropdown for filtered assets */}
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
            
            {/* Swap Back Asset - Fixed to USDT */}
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
                    disabled={isSubmitting || hasPendingSwap}
                    min={moment().add(5, 'minutes').format("YYYY-MM-DDTHH:mm")}
                    max={moment().add(30, 'days').format("YYYY-MM-DDTHH:mm")}
                />
                {timeError && <p className="error-message">{timeError}</p>}
                <p className="helper-text">Must be between 5 minutes and 30 days from now</p>
            </div>
            
            {/* Updated Swap Button to match the image */}
            <button
                className="circle-swap-btn"
                onClick={handleSwap}
                disabled={isSubmitting || hasPendingSwap || timeError || !swapToAsset}
            >
                {/* Swap icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 16L3 12M3 12L7 8M3 12H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 8L21 12M21 12L17 16M21 12H3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
                {isSubmitting && <span className="loading-text">...</span>}
            </button>
            
            {message && <p className={message.includes("successfully") ? "success-message" : "status-message"}>{message}</p>}
            {hasPendingSwap && <p className="status-message">You have a pending swap request.</p>}
        </div>
    );
};

export default Swap;