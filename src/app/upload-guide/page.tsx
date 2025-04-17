import React from 'react';

export default function UploadGuidePage() {
  return (
    <div>
      <h1>ESG Upload Guide / Help</h1>

      <section>
        <h2>Overview of ESG Categories</h2>
        {/* Example using details/summary for collapsible sections */}
        <details>
          <summary><strong>Environmental</strong></summary>
          <p>Example Documents: Utility bills, carbon inventory spreadsheets.</p>
          <p>📄 Scope 1 & 2 emissions → Upload utility bills or carbon inventory spreadsheets</p>
        </details>
        <details>
          <summary><strong>Social</strong></summary>
          <p>Example Documents: Employee handbooks, diversity reports.</p>
          {/* Add more examples */}
        </details>
        <details>
          <summary><strong>Governance</strong></summary>
          <p>Example Documents: Board charters, governance policies, annual reports.</p>
          <p>📑 Board diversity → Upload governance policy or annual report page 3–4</p>
        </details>
      </section>

      <section>
        <h2>Best Practices</h2>
        <ul>
          <li>Data Recency: Ensure data is up-to-date.</li>
          <li>Document Quality: Upload clear, legible documents.</li>
          <li>Preferred Formats: PDF, CSV, XLSX, JSON are preferred for easier processing.</li>
        </ul>
      </section>

      <section>
        <h2>FAQs</h2>
        <details>
          <summary>What if I don’t have all the data?</summary>
          <p>Provide what you can. Our platform helps identify gaps.</p>
        </details>
        <details>
          <summary>What documents can I use?</summary>
          <p>Refer to the category examples above. Common sources include annual reports, sustainability reports, utility bills, HR records, and policy documents.</p>
        </details>
        <details>
          <summary>How is my data protected?</summary>
          <p>[Placeholder for data protection information - link to privacy policy, etc.]</p>
        </details>
      </section>
    </div>
  );
}