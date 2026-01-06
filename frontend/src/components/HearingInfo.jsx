import React from 'react'
import './HearingInfo.css'

function HearingInfo() {
  return (
    <div className="hearing-container">
      <div className="hearing-card">
        <h2>Administrative Wage Garnishment – Hearing Information</h2>

        <section className="hearing-section">
          <h3>Administrative Wage Garnishment Background for Individuals</h3>
          <p>
            <a 
              href="/awg-background" 
              className="inline-link"
              target="_blank"
              rel="noreferrer"
            >
              Administrative Wage Garnishment (AWG)
            </a>{' '}
            is a debt collection process that allows a federal agency to order a non-federal employer
            to withhold up to 15 percent of an employee&apos;s disposable income to pay a nontax
            delinquent debt owed to the agency.
          </p>
          <p className="muted">
            (Not an individual? This page focuses on individuals. Employers and federal agencies
            should refer to guidance provided by the Bureau of the Fiscal Service.)
          </p>
        </section>

        <section className="hearing-section">
          <h3>Requesting a Hearing</h3>
          <p>
            You may request a hearing if you believe that you do not owe the debt, disagree with the
            amount that the government claims you owe, or if the proposed garnishment would cause a
            financial hardship.
          </p>
          <p>
            If you are claiming financial hardship, a financial statement with supporting
            documentation must be submitted with the hearing request form (which can be downloaded
            below).
          </p>

          <div className="hearing-links">
            <h4>Download forms</h4>
            <ul>
              <li>
                <a
                  href="https://www.fiscal.treasury.gov/files/cross-servicing/awg-hearing-request.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download Hearing Request PDF
                </a>
              </li>
              <li>
                <a
                  href="https://www.fiscal.treasury.gov/files/cross-servicing/awg-fin-stmt-english.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download AWG Financial Statement PDF
                </a>
              </li>
              <li>
                <a
                  href="https://www.fiscal.treasury.gov/files/cross-servicing/awg-fin-stmt-spanish.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download AWG Financial Statement (Español) PDF
                </a>
              </li>
            </ul>
          </div>
        </section>

        <section className="hearing-section">
          <h3>Bankruptcy and Employment Status</h3>
          <p>
            If you have filed for bankruptcy and it includes an automatic bankruptcy stay, please let
            us know immediately. Your wages should not be garnished while the stay is in effect.
          </p>
          <p>
            Also, let us know if you have not held your current job for at least 12 months, and you
            were involuntarily separated from your last job. You will need to provide documentation
            about your involuntary termination, such as a letter from your employer stating the reason
            for your termination.
          </p>
        </section>

        <section className="hearing-section">
          <h3>Fiscal Service Contact Information</h3>
          <p>
            <strong>Debt Recovery Analyst:</strong> 1-888-826-3127
            <br />
            <strong>Federal Relay Service for hearing impaired (TDD):</strong> 1-800-877-8339
          </p>
          <p>
            <strong>Mailing Address</strong>
            <br />
            U.S. Department of the Treasury
            <br />
            P.O. Box 830794
            <br />
            Birmingham, AL 35283-0794
          </p>
        </section>

      </div>
    </div>
  )
}

export default HearingInfo

