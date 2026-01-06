import React, { useState } from 'react'
import './GovernmentBanner.css'

function GovernmentBanner() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="usa-banner">
      <div className="usa-banner__header">
        <div className="usa-banner__inner">
          <div className="grid-col-auto">
            <img
              className="usa-banner__header-flag"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='31' viewBox='0 0 52 31'%3E%3Crect fill='%23B22234' width='52' height='31'/%3E%3Crect fill='%23FFFFFF' width='52' height='2.38'/%3E%3Crect y='4.76' fill='%23B22234' width='52' height='2.38'/%3E%3Crect y='9.52' fill='%23FFFFFF' width='52' height='2.38'/%3E%3Crect y='14.29' fill='%23B22234' width='52' height='2.38'/%3E%3Crect y='19.05' fill='%23FFFFFF' width='52' height='2.38'/%3E%3Crect y='23.81' fill='%23B22234' width='52' height='2.38'/%3E%3Crect y='28.57' fill='%23FFFFFF' width='52' height='2.38'/%3E%3Crect fill='%23002269' width='20.8' height='16.67'/%3E%3C/svg%3E"
              alt="U.S. flag"
            />
          </div>
          <div className="grid-col-fill tablet:grid-col-auto">
            <p className="usa-banner__header-text">
              An official website of the United States government
            </p>
            <p className="usa-banner__header-action" aria-hidden="true">
              Here's how you know
            </p>
          </div>
          <button
            className="usa-banner__button"
            aria-expanded={isExpanded}
            aria-controls="gov-banner"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="usa-banner__button-text">Here's how you know</span>
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="usa-banner__content" id="gov-banner">
          <div className="grid-row grid-gap-lg">
            <div className="usa-banner__guidance tablet:grid-col-6">
              <img
                className="usa-banner__icon usa-banner__icon--size-50"
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50'%3E%3Ccircle cx='25' cy='25' r='20' fill='%23000000'/%3E%3Ctext x='25' y='30' font-size='20' fill='white' text-anchor='middle'%3E.gov%3C/text%3E%3C/svg%3E"
                alt="Dot gov"
              />
              <div className="usa-banner__text">
                <strong>Official websites use .gov</strong>
                <br />
                A <strong>.gov</strong> website belongs to an official government organization in the United States.
              </div>
            </div>
            <div className="usa-banner__guidance tablet:grid-col-6">
              <img
                className="usa-banner__icon usa-banner__icon--size-50"
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50'%3E%3Crect x='10' y='15' width='30' height='20' rx='2' fill='%23000000'/%3E%3Cpath d='M15,25 L20,30 L35,15' stroke='white' stroke-width='3' fill='none'/%3E%3C/svg%3E"
                alt="Https"
              />
              <div className="usa-banner__text">
                <strong>Secure .gov websites use HTTPS</strong>
                <br />
                A <strong>lock</strong> (
                <span className="icon-lock" aria-label="Locked padlock icon">
                  🔒
                </span>
                ) or <strong>https://</strong> means you've safely connected to the .gov website. Share sensitive information only on official, secure websites.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GovernmentBanner
