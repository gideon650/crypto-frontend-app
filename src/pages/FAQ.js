import React from "react";
import { Link } from "react-router-dom";
import "./FAQ.css";

const FAQ = () => {
  const faqs = [
    {
      question: "Is SwapViewApp legit or a scam?",
      answer: "SwapViewApp is a legitimate trading platform backed by a proven, high-performance strategy. With over 72.5% win rate, the company has grown a starting capital of $6 million to $97.6 million, demonstrating consistent profitability. Our transparent operations, secure infrastructure, and clear communication with users underscore our legitimacy."
    },
    {
      question: "Who owns SwapViewApp?",
      answer: "SwapViewApp is owned and operated by a private trading company led by a seasoned team of quantitative traders and developers. The team combines algorithmic strategies, risk management, and automated systems to execute high-yield trades, focusing on Decentralized Exchanges (DEXs)."
    },
    {
      question: "How does SwapViewApp protect my money?",
      answer: "SwapViewApp prioritizes fund security and transparency. We use the following measures: Non-custodial model: Users maintain full control over their funds. Smart contract integration: Trades are executed on-chain, with verifiable results. End-to-end encryption and secure APIs. Real-time Telegram alerts and audit trails for full visibility into trade history and wallet activity. Integration of P2P allows each user to receive fiat directly to their bank account, enabling automated reconciliation of fiat payments and instant wallet crediting."
    },
    {
      question: "How do I withdraw funds from SwapViewApp?",
      answer: "Withdrawals from SwapViewApp are designed to be fast, secure, and user-friendly: For crypto: Users can withdraw directly to their wallets via our on-chain gateway. For fiat: Users can transfer funds from their in-app wallet to their linked bank accounts via P2P. Withdrawals are processed automatically upon request, with no unnecessary delays."
    },
    {
      question: "Are there any hidden fees on SwapViewApp?",
      answer: "SwapViewApp maintains a transparent fee structure: No hidden fees — users see exactly what they pay. Trading fees are minimal and clearly disclosed before any operation. Fiat deposits and withdrawals via p2p may incur standard processing fees, which are also visible at the time of transaction. We believe in clarity and honesty, especially when it comes to your money."
    },
    {
      question: "Is SwapViewApp regulated?",
      answer: "SwapViewApp operates within jurisdictions that support crypto and decentralized finance (DeFi) trading. While decentralized platforms do not fall under traditional financial regulation, we comply with applicable KYC/AML standards for fiat transactions. We are also actively exploring additional licenses and partnerships to enhance regulatory alignment as the ecosystem evolves."
    },
    {
      question: "How can I contact SwapViewApp support?",
      answer: (
        <>
          Our support team is available through multiple channels: In-app chat: Get instant assistance directly in the app. Telegram support bot: Integrated command handlers like /get_config, /profit, and /wallets allow users to retrieve real-time data and request help. Email: Reach us at{" "}
          <a href="mailto:support@swapviewapp.site" className="email-link">
            support@swapviewapp.site
          </a>{" "}
          Knowledge base & FAQ: Access step-by-step guides and answers to common questions directly in the app or on our website. We're committed to providing responsive and helpful support to all our users.
        </>
      )
    }
  ];

  return (
    <div className="faq-container">
      <div className="faq-header">
        <h2>SWAPVIEWAPP FAQ</h2>
        <p>Frequently Asked Questions about SwapViewApp</p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <div className="faq-question">
              <span>{index + 1}.</span> {faq.question}
            </div>
            <div className="faq-answer">{faq.answer}</div>
          </div>
        ))}
      </div>

      <Link to="/settings" className="faq-back-button">
        Back to Settings
      </Link>
    </div>
  );
};

export default FAQ;