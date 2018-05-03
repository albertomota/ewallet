import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import PLAYTableHeader from './PLAYTableHeader';
import PLAYTableContentRow from './PLAYTableContentRow';
import { formatHeader, defaultHeaderAlignment } from '../helpers/tableFormatter';

class PLAYTable extends Component {
  constructor(props) {
    super(props);
    const { by, dir } = props.sort;
    const sort = { by, dir };
    this.state = (sort);
    this.onSort = this.onSort.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.sort);
  }

  onSort(by, dir) {
    this.setState(
      { by, dir },
      () => {
        const { updateSorting } = this.props;
        updateSorting({ by, dir });
      },
    );
  }

  render() {
    const { by, dir } = this.state;
    const { headers, content, handleCallback } = this.props;
    const firstRow = content[0];
    const alignments = firstRow
      ? Object.keys(firstRow).map(key => formatHeader(firstRow, key))
      : [];
    const tableHeaders = Object.keys(headers).map((key, index) => {
      const header = headers[key];
      return (<PLAYTableHeader
        key={key}
        alignment={alignments[index] || defaultHeaderAlignment}
        handleClick={this.onSort}
        id={key}
        sortable={header.sortable}
        sortDirection={key === by ? dir : 'default'}
        title={header.title}
      />);
    });
    const tableContent = content.map(row => (
      <PLAYTableContentRow
        key={row.id.value}
        data={row}
        handleCallback={handleCallback}
      />
    ));
    return (
      <Table responsive>
        <thead>
          <tr>
            {tableHeaders}
          </tr>
        </thead>
        <tbody>
          {tableContent}
        </tbody>
      </Table>
    );
  }
}

PLAYTable.propTypes = {
  content: PropTypes.array.isRequired,
  handleCallback: PropTypes.object,
  headers: PropTypes.object.isRequired,
  sort: PropTypes.object.isRequired,
  updateSorting: PropTypes.func.isRequired,
};

PLAYTable.defaultProps = {
  handleCallback: {
    onSuccess: () => {},
    onFailed: () => {},
  },
};

export default PLAYTable;
