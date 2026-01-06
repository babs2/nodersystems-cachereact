import React from 'react'
import './HearingInfo.css'

function AWGBackground() {
  return (
    <div className="hearing-container">
      <div className="hearing-card">
        <h2>Administrative Wage Garnishment Background</h2>

        <section className="hearing-section">
          <p>
            Administrative Wage Garnishment (AWG) is a debt collection process that allows a federal
            agency to order a non-federal employer to withhold up to 15 percent of an employee&apos;s
            disposable income to pay a delinquent non-tax debt owed to the agency. More information
            about administrative wage garnishment is available for individuals, employers, and federal
            agencies.
          </p>
        </section>

        <section className="hearing-section">
          <h3>Garnishment Process</h3>
          <p>
            Fiscal Service&apos;s Cross-Servicing program may issue a wage garnishment order to a
            non-federal employer to collect a delinquent federal non-tax debt on behalf of a federal
            agency. A court order is not needed. The wage garnishment order will require the employer
            to withhold and send the amounts deducted to Fiscal Service for payment to the federal
            agency. The AWG process is governed by federal law. State laws do not apply.
          </p>
          <p>
            A debtor may request an administrative hearing before a wage garnishment starts. A hearing
            may be requested on the existence of the debt, or amount of the debt, or the terms of the
            proposed repayment schedule under the garnishment order (hardship).
          </p>
          <ul className="hearing-list">
            <li>
              If the debtor requests a hearing within 15 business days after the date on the letter
              notifying the debtor of the proposed garnishment, a hearing must be held before Fiscal
              Service sends a wage garnishment order to the individual&apos;s employer.
            </li>
            <li>
              If the debtor requests a hearing more than 15 business days after the date on the letter
              notifying the debtor of the proposed garnishment, a hearing will still be provided but
              the wage garnishment order may be sent to the individual&apos;s employer.
            </li>
          </ul>
          <p>
            The hearing official will determine whether the hearing will be oral or written.
          </p>
        </section>

        <section className="hearing-section">
          <h3>Guidance and References</h3>
          <ul className="hearing-list">
            <li>
              The AWG process is authorized by 31 U.S.C. § 3720D and the corresponding regulation at 31 CFR § 285.11.
            </li>
            <li>
              Federal agencies must use Standard Form 329 (SF-329) to issue AWG orders.
            </li>
            <li>
              Fiscal Service and its private collection agencies (PCAs) will assist the federal agencies by identifying debtors eligible for AWG. A federal agency may not garnish wages if a debtor has not been in their current job for at least 12 months and was involuntarily separated from their previous job.
            </li>
            <li>
              Fiscal Service and its PCAs will monitor collections under the AWG order to ensure employer compliance.
            </li>
            <li>
              Federal agencies are generally required to participate in AWG through Fiscal Service&apos;s Cross-Servicing program.
            </li>
            <li>
              Federal agencies must publish AWG regulations and establish hearing procedures before they are eligible to participate in the AWG program.
            </li>
            <li>
              Federal agencies have the option of conducting the hearings in-house or allowing Fiscal Service to conduct AWG hearings on their behalf.
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default AWGBackground
