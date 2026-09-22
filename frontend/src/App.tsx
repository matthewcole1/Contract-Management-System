import { useEffect, useState } from "react";
import { getContracts, getOptions } from "./api";

type Contract = {
  id: number;
  kch_number: string;
  institution_company_name: string;
  department: string;
  contract_type: string;
  contract_status: string;
  legal_status: string;
};

type Options = {
  contract_statuses: string[];
  legal_statuses: string[];
  contract_types: string[];
  departments: {
    id: number;
    name: string;
  }[];
  personnel: {
    id: number;
    name: string;
    role: string | null;
    department: string | null;
  }[];
};

function App() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [options, setOptions] = useState<Options | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const contractsData = await getContracts();
        const optionsData = await getOptions();

        setContracts(contractsData.contracts);
        setOptions(optionsData);
      } catch (err) {
        console.error(err);
        setError("Could not load contract data.");
      }
    }

    loadData();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  return (
  <main>
    <h1>Kings County Hospital Contract Management</h1>

    <section>
      <h2>Contracts</h2>

      <p>Total contracts: {contracts.length}</p>

      <table>
        <thead>
          <tr>
            <th>KCH #</th>
            <th>Institution / Company</th>
            <th>Department</th>
            <th>Contract Type</th>
            <th>Status</th>
            <th>Legal Status</th>
          </tr>
        </thead>

        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.id}>
              <td>{contract.kch_number}</td>
              <td>{contract.institution_company_name}</td>
              <td>{contract.department}</td>
              <td>{contract.contract_type}</td>
              <td>{contract.contract_status}</td>
              <td>{contract.legal_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Available Contract Types</h2>

      <ul>
        {options?.contract_types.map((type) => (
          <li key={type}>{type}</li>
        ))}
      </ul>
    </section>
  </main>
);
}

export default App;