// TermsModal.js
import React, { useState } from "react";
import "./TermsModal.css";

const TermsModal = ({ onAccept, show }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleAccept = () => {
    if (isChecked) {
      localStorage.setItem("termsAccepted", "true");
      onAccept();
    }
  };

  if (!show) return null;

  return (
    <div className="terms-modal-overlay">
      <div className="terms-modal">
        <div className="terms-modal-header">
          <h2>Terms and Conditions</h2>
        </div>
        <div className="terms-modal-content">
          <div className="terms-text">
            <h3>SwapView Terms and Conditions</h3>
            <p>
              These Terms and Conditions ("Terms") constitute a legally binding agreement between you
              ("User", "you") and SwapView Ltd. ("SwapView", "we", "our", "us") regarding your access
              to and use of Swapviewapp.com, its services, wallet system, trading features, and related
              platforms.
            </p>
            
            <p>
              By creating an account, funding your wallet, executing a transaction, or using our services
              in any way, you agree to comply with these Terms. If you do not agree, you must discontinue
              use immediately.
            </p>

            <h4>1. Eligibility</h4>
            <ul>
              <li>You must be at least 18 years of age and legally capable of entering into binding contracts under applicable law.</li>
              <li>You confirm that all details provided (full name, email, bank account, identification, etc.) are accurate and verifiable.</li>
              <li>You are strictly limited to one SwapView account unless expressly authorized by SwapView in writing. Multiple accounts created to exploit the system will be permanently banned.</li>
            </ul>

            <h4>2. Account Registration & Security</h4>
            <ul>
              <li>Upon registration, you will receive a SwapView Wallet and, where applicable, a Virtual Bank Account for funding.</li>
              <li>You must keep login credentials, PINs, and verification codes confidential. You bear full responsibility for all actions under your account.</li>
              <li>SwapView is not liable for unauthorized access caused by your negligence (e.g., sharing login details, weak passwords, or phishing).</li>
              <li>We reserve the right to demand additional KYC/AML verification at any stage (government-issued ID, utility bill, live verification). Failure to comply will result in restricted account functionality.</li>
            </ul>

            <h4>3. Wallet Funding & Deposits</h4>
            <ul>
              <li>Wallet may be funded via p2p, bybit or on-chain method.</li>
              <li>Payments made through third-party accounts may be rejected.</li>
              <li>After completing an on-chain or bybit deposit, the user must submit a funding request within 30 minutes via the platform for the transaction to be recognized.</li>
              <li>SwapView is not responsible for delays or losses caused by incomplete references, wrong transfer details, or errors made by the user.</li>
              <li>Deposits are considered final and non-reversible once credited.</li>
              <li>If a deposit made isn't credited within 24 hours, contact support.</li>
            </ul>

            <h4>4. Withdrawals</h4>
            <ul>
              <li>Withdrawal are strictly paid to the bank account, bybit uid, or wallet address you provided during withdrawal.</li>
              <li>Withdrawal requests may be delayed if additional verification is required.</li>
              <li>SwapView reserves the right to withhold or reverse withdrawals suspected of abuse, fraud, or violation of these Terms.</li>
              <li>Incorrect account numbers provided by the user are their sole responsibility. SwapView shall not be liable for funds lost due to wrong details.</li>
              <li>Your account will be permanently frozen if you fail to approve a withdrawal made via P2P within 24 hours of receiving the payment, in the event that any merchants file a complaint with our support team.</li>
            </ul>

            <h4>5. Trading & Usage Rules</h4>
            <ul>
              <li>SwapView is built for trading, swaps, and related financial activities.</li>
              <li>Users are strictly forbidden from:
                <ul>
                  <li>Funding an account and conducting internal transfers to another user account, then attempting withdrawal without placing trades.</li>
                  <li>Using SwapView solely as a payment pass-through system without legitimate trading activity.</li>
                  <li>Depositing and immediately withdrawing without engaging in trading.</li>
                </ul>
              </li>
              <li>Accounts found engaging in such practices will be permanently suspended, with funds subject to investigation and possible forfeiture.</li>
              <li>SwapView reserves the right to monitor all trading activity to ensure compliance.</li>
            </ul>

            <h4>6. Transactions & P2P Swaps</h4>
            <ul>
              <li>All p2p transactions compliant must include a valid receipt, transaction IDs and other information that you may be required to submit.</li>
              <li>SwapView will not honor claims without proper evidence.</li>
              <li>Users acknowledge that errors in entering UIDs, wallet addresses, or account numbers may render funds permanently lost.</li>
              <li>SwapView may act as an arbitrator in disputes but does not guarantee recovery of misplaced funds.</li>
            </ul>

            <h4>7. Referral Program</h4>
            <ul>
              <li>Referral codes may be issued to users for promotional purposes.</li>
              <li>Referral benefits are subject to change or termination at SwapView's discretion.</li>
              <li>Fraudulent activities, such as creating fake accounts or circular transfers to exploit referral rewards, will result in account bans and loss of rewards.</li>
            </ul>

            <h4>8. Prohibited Conduct</h4>
            <p>You agree NOT to:</p>
            <ul>
              <li>Use SwapView for illegal purposes including money laundering, terrorist financing, fraud, or scams.</li>
              <li>Interfere with or bypass SwapView's security, verification, or anti-fraud systems.</li>
              <li>Create multiple accounts to exploit bonuses, referrals, or funding/withdrawal limits.</li>
              <li>Misrepresent transaction details or forge receipts.</li>
              <li>Harass or abuse SwapView staff, partners, or other users.</li>
            </ul>
            <p>Violations will result in immediate suspension and permanent ban.</p>

            <h4>9. Risk Disclosure</h4>
            <ul>
              <li>All trading involves risk of loss. SwapView does not guarantee profits, success, or recovery of losses.</li>
              <li>Market volatility, liquidity shortages, technical failures, or third-party processor delays are outside SwapView's control.</li>
              <li>Users acknowledge they are responsible for their own trading decisions.</li>
            </ul>

            <h4>10. Support & Disputes</h4>
            <ul>
              <li>Official support is available through support@swapviewapp.com only.</li>
              <li>Users must provide complete details (account email, transaction reference, receipts) for resolution.</li>
              <li>SwapView will investigate disputes fairly, but its decision shall be final and binding.</li>
            </ul>

            <h4>11. Compliance & Monitoring</h4>
            <ul>
              <li>All transactions are monitored under Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) regulations.</li>
              <li>SwapView reserves the right to report suspicious activity to relevant authorities.</li>
              <li>Accounts may be frozen during investigations into suspicious activity.</li>
            </ul>

            <h4>12. Limitation of Liability</h4>
            <ul>
              <li>SwapView shall not be liable for:
                <ul>
                  <li>User errors (wrong details, missed references, mistaken transfers).</li>
                  <li>Bank, processor, or third-party exchange delays/failures.</li>
                  <li>Losses due to system downtime, internet issues, or external hacks beyond SwapView's control.</li>
                </ul>
              </li>
              <li>In no event shall SwapView's liability exceed the total funds in your wallet at the time of claim.</li>
            </ul>

            <h4>13. Termination</h4>
            <ul>
              <li>SwapView may suspend or permanently ban accounts for violation of these Terms.</li>
              <li>Funds in banned accounts may be withheld, forfeited, or reported to authorities if linked to illegal or abusive behavior.</li>
              <li>Users may request voluntary closure of their accounts if all obligations are settled.</li>
            </ul>

            <h4>14. Amendments</h4>
            <p>SwapView reserves the right to amend these Terms at any time. Updates will be communicated on the website or by email. Continued use after amendments constitutes acceptance.</p>

            <h4>15. Governing Law</h4>
            <p>These Terms shall be governed by and construed under the laws of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of Nigerian courts.</p>

            <h4>16. Contact Information</h4>
            <p>📧 support@swapviewapp.com</p>
            <p>🌐 www.swapviewapp.com</p>

            <h3>SwapView Risk Disclaimer</h3>
            <p>Effective Date: [22-05-2023]</p>
            <p>Last Updated: [14-09-2025]</p>
            
            <p>This Risk Disclaimer applies to all users of SwapViewapp. and the services available on Swapviewapp.com. By using our platform, you acknowledge and accept the risks outlined below.</p>

            <h4>1. No Investment Advice</h4>
            <ul>
              <li>All information provided on SwapView (including trading signals, strategies, market analysis, or community discussions) is for educational and informational purposes only.</li>
              <li>SwapView does not provide financial, legal, tax, or investment advice.</li>
              <li>Users are solely responsible for evaluating risks before making any trading or financial decisions.</li>
            </ul>

            <h4>2. Trading Risks</h4>
            <ul>
              <li>Trading cryptocurrencies, digital assets, and related markets carries a high level of risk, and is not suitable for everyone.</li>
              <li>Prices of digital assets are extremely volatile and may be affected by regulatory changes, market manipulation, or global events.</li>
              <li>Users may lose part or all of their invested capital.</li>
              <li>SwapView does not guarantee profits or the accuracy of any trading signals, calls, or forecasts.</li>
            </ul>

            <h4>3. No Guarantees</h4>
            <ul>
              <li>Past performance of strategies, signals, or community calls does not guarantee future results.</li>
              <li>SwapView makes no promises regarding:
                <ul>
                  <li>Profitability of trades.</li>
                  <li>Accuracy, reliability, or timeliness of information.</li>
                  <li>Recovery of funds lost due to trading losses.</li>
                </ul>
              </li>
            </ul>

            <h4>4. Platform Risks</h4>
            <ul>
              <li>Users accept that system downtime, server issues, internet connectivity problems, or third-party provider failures may affect trading.</li>
              <li>SwapView will not be held liable for losses caused by:
                <ul>
                  <li>Technical errors.</li>
                  <li>Delays in deposits or withdrawals.</li>
                  <li>Suspension of services due to maintenance or compliance investigations.</li>
                </ul>
              </li>
            </ul>

            <h4>5. User Responsibility</h4>
            <ul>
              <li>All trades executed on SwapView are done at your own risk.</li>
              <li>You are solely responsible for ensuring:
                <ul>
                  <li>You understand the risks of digital asset trading.</li>
                  <li>You only invest money you can afford to lose.</li>
                  <li>You conduct your own independent research before making decisions.</li>
                </ul>
              </li>
              <li>By trading on SwapView, you acknowledge that you may lose your entire capital.</li>
            </ul>

            <h4>6. No Liability</h4>
            <ul>
              <li>SwapView, its staff, partners, and affiliates shall not be held liable for:
                <ul>
                  <li>Financial losses incurred from trading activities.</li>
                  <li>Reliance on trading calls, referrals, or strategies.</li>
                  <li>Market fluctuations, regulatory actions, or force majeure events.</li>
                </ul>
              </li>
              <li>The maximum liability of SwapView shall not exceed the total balance available in your wallet at the time of a claim.</li>
            </ul>

            <h4>7. External Links & Third-Party Services</h4>
            <ul>
              <li>SwapView may provide links to third-party platforms, charts, or services. These are provided "as-is" without warranties.</li>
              <li>SwapView is not responsible for the security, accuracy, or reliability of external platforms.</li>
            </ul>

            <h4>8. Regulatory Disclaimer</h4>
            <ul>
              <li>Digital asset trading may be restricted or regulated in your jurisdiction.</li>
              <li>It is your sole responsibility to ensure that your use of SwapView complies with applicable laws.</li>
              <li>SwapView does not guarantee that its services are legal in your country.</li>
            </ul>

            <h4>9. Amendments</h4>
            <p>SwapView reserves the right to update this Risk Disclaimer at any time. Continued use of the platform means acceptance of the updated terms.</p>

            <h4>10. Acknowledgment</h4>
            <p>By registering, funding your wallet, or executing trades on SwapView, you confirm that:</p>
            <ul>
              <li>You fully understand the risks involved.</li>
              <li>You accept that trading losses are your sole responsibility.</li>
              <li>You release SwapView from any liability for financial losses.</li>
            </ul>

            <p>
              By accepting these terms, you acknowledge that you have read, understood, and agree to be
              bound by all the terms and conditions outlined above.
            </p>
          </div>
        </div>
        <div className="terms-modal-actions">
          <label className="terms-checkbox">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
            />
            <span>I have read and agree to the Terms and Conditions</span>
          </label>
          <button
            className={`accept-terms-btn ${!isChecked ? "disabled" : ""}`}
            onClick={handleAccept}
            disabled={!isChecked}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;