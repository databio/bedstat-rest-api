import { ProgressBar } from 'react-bootstrap';
import { SearchResponse } from '../../queries/useSearch';

type Props = {
  results: SearchResponse;
};

export const SearchResultsTable = (props: Props) => {
  const { results } = props;
  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Score</th>
          <th scope="col">BEDbase ID</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result) => (
          <tr key={result.id}>
            <td>{result.metadata.name}</td>
            <td>
              <ProgressBar now={result.score * 100} label={`${result.score * 100}%`} variant="primary" />
            </td>
            <td>{result.id}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
