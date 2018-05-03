import React from 'react';
import { connect } from 'react-redux';
import loadUsers from './actions';
import tables from './tables';
import headerText from './header';
import PLAYCompleteTable from '../../../../components/PLAYCompleteTable';

const Users = props => (
  <PLAYCompleteTable
    createRecordUrl="/users/new"
    headerText={headerText}
    tables={tables}
    visible={{ addBtn: false }}
    {...props}
  />
);

const mapDispatchToProps = dispatch => ({
  loadData: (query, onSuccess) => dispatch(loadUsers(query, onSuccess)),
});

export default connect(null, mapDispatchToProps)(Users);
