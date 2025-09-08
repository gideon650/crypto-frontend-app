import React from "react";
import { Link } from "react-router-dom";
import "./about.css";

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h2>ABOUT SWAPVIEW</h2>
        <p>Your cutting-edge Web3 trading platform</p>
      </div>

      <div className="about-content">
        <div className="about-section">
          <h3 className="about-section-title">WHAT IS SWAPVIEW?</h3>
          <p className="about-section-content">
            SWAPVIEW is a cutting-edge Web3 platform designed for both seasoned DeFi users and degen traders who thrive on speed, transparency, and opportunities others miss. Whether you're yield farming, swapping low-cap gems, or diving into the next breakout protocol, SWAPVIEW gives you the edge.
          </p>
        </div>

        <div className="about-section">
          <h3 className="about-section-title">WHY USE SWAPVIEW?</h3>
          <div className="about-section-content">
            <ul className="about-list">
              <li><strong>Real-Time DeFi Insights:</strong> Get live token data, swap analytics, liquidity trends, and gas optimizations — all on one intuitive dashboard.</li>
              <li><strong>Degen Radar:</strong> Discover the hottest tokens before they trend. SWAPVIEW scans early listings, contract activity, and trading patterns to surface potential moonshots.</li>
              <li><strong>Multi-Chain Ready:</strong> Not locked into one chain. Whether it's Ethereum, BSC, Base, Arbitrum, or Solana — we've got eyes on everything.</li>
              <li><strong>Anonymous & Permissionless:</strong> No KYC. No limits. Just your wallet and the blockchain.</li>
              <li><strong>Trade Smarter, Not Slower:</strong> Built for speed. Fast token swaps, frontrun protection, and seamless UX optimized for both mobile and desktop.</li>
              <li><strong>Community-First:</strong> Transparent governance. Airdrop incentives. Degen leaderboard. We grow together.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="about-footer">
        <p>Swap Fast. Trade Smart. Stay Degen.</p>
        <p>That awesome DeFi edge.</p>
        <p>Welcome to SWAPVIEW.</p>
      </div>
    </div>
  );
};

export default About;