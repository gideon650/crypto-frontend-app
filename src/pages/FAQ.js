import React from "react";
import { Link } from "react-router-dom";
import "./FAQ.css";

const FAQ = () => {
  const faqs = [
    {
      question: "How does the Referral Program work?",
      answer: "Simply share your unique referral link with others. When someone signs up through your link and makes a verified investment of at least $5, you'll receive 1 $SWV as a reward."
    },
    {
      question: "Where can I find my referral link?",
      answer: "You can find your unique referral link by logging into your dashboard and navigating to the 'Referral Program' section."
    },
    {
      question: "When will I receive my reward?",
      answer: "Rewards are typically credited within [24-72 hours] after your referred user's investment is verified."
    },
    {
      question: "Is there a limit to how many people I can refer?",
      answer: "No! There's no limit — the more people you refer who invest, the more coins you earn."
    },
    {
      question: "What counts as a successful referral?",
      answer: "A referral is considered successful when the person you invited: Signs up using your link or code, Completes the minimum investment requirement, Passes all necessary verification checks."
    },
    {
      question: "Can I refer myself using a different account?",
      answer: "No. Self-referrals are strictly prohibited and will result in disqualification from the program."
    },
    {
      question: "What happens if my referral cancels or withdraws their investment?",
      answer: "If the initial investment is reversed, canceled, or found to be fraudulent, the referral reward may be revoked."
    },
    {
      question: "How can I track my referrals and earnings?",
      answer: "You can track all your referrals, their status, and your earned rewards in the 'Referral Dashboard' section of your account."
    },
    {
      question: "Can I earn extra bonuses?",
      answer: "Yes! Special bonus rewards are available when you reach certain referral milestones (3). Keep an eye on your dashboard for bonus updates!"
    },
    {
      question: "Who can I contact if I have issues with my referral rewards?",
      answer: (
        <>
          If you experience any issues, please reach out to our Support Team through{" "}
          <a href="mailto:support@swapviewapp.site" className="email-link">
            support@swapview.com
          </a>{" "}
          or use the Help Center inside your dashboard.
        </>
      )
    }
  ];

  return (
    <div className="faq-container">
      <div className="faq-header">
        <h2>REFERRAL PROGRAM FAQ</h2>
        <p>Frequently Asked Questions about our referral program</p>
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
