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
    // We're still checking this flag but it won't block new swap creation
    const [hasPendingSwap, setHasPendingSwap] = useState(false);
    
    const dropdownRef = useRef(null);
    const usdtAsset = assets.find(asset => asset.symbol === "USDT");

    useEffect(() => {
        fetchAssets();
        checkPendingSwap();
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

        const localMoment = moment(selectedTime);
        const lagosMoment = localMoment.clone().tz('Africa/Lagos');
        const now = moment().tz('Africa/Lagos');
        const diffMinutes = lagosMoment.diff(now, 'minutes');
        
        let error = "";
        if (diffMinutes <= 0) {
            error = "Swap back time must be in the future (Africa/Lagos time).";
        } else if (diffMinutes < 5) {
            error = "Swap duration must be at least 5 minutes (Africa/Lagos time).";
        } else if (diffMinutes > 43200) {
            error = "Swap duration cannot exceed 30 days (Africa/Lagos time).";
        }
        
        setTimeError(error);
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

        if (parseFloat(swapAmount) <= 0) {
            setMessage("Swap amount must be greater than zero.");
            return;
        }

        if (timeError) {
            setMessage(timeError);
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const localMoment = moment(swapBackTime);
            const lagosMoment = localMoment.clone().tz('Africa/Lagos');
            
            const payload = {
                from_asset: getAssetId(swapFromAsset),
                to_asset: getAssetId(swapToAsset),
                swap_amount: swapAmount,
                swap_back_asset: getAssetId(swapBackAsset),
                // Send in ISO format as expected by backend
                swap_back_time: lagosMoment.format('YYYY-MM-DDTHH:mm:ss')
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
                disabled={isSubmitting}
            />
            
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
                    min={moment().tz('Africa/Lagos').format("YYYY-MM-DDTHH:mm")}
                    max={moment().tz('Africa/Lagos').add(30, 'days').format("YYYY-MM-DDTHH:mm")}
                />
                {timeError && <p className="error-message">{timeError}</p>}
                <p className="helper-text">Must be between 5 minutes and 30 days from now</p>
            </div>
            
            <button
                className="circle-swap-btn"
                onClick={handleSwap}
                disabled={isSubmitting || timeError || !swapToAsset}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 16L3 12M3 12L7 8M3 12H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 8L21 12M21 12L17 16M21 12H3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isSubmitting && <span className="loading-text">...</span>}
            </button>
            
            {message && <p className={message.includes("successfully") ? "success-message" : "status-message"}>{message}</p>}
            {hasPendingSwap && (
                <p className="status-info">
                    You have pending swap requests. New requests will be processed as long as you have sufficient balance.
                </p>
            )}
        </div>
    );
};

export default Swap;
