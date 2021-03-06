import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'react-localize-redux';
import { Form, FormGroup, InputGroup, DropdownButton, MenuItem } from 'react-bootstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import PLAYLoadingButton from './PLAYLoadingButton';
import { upperCaseFirst } from '../helpers/stringFormatter';

class PLAYAddMemberForm extends Component {
  static actionType() {
    return {
      add: 'add',
      update: 'update',
      remove: 'remove',
    };
  }

  static checkValidEmail(text) {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(text);
  }

  constructor(props) {
    super(props);
    const {
      member, roles, translate, typeaheadOptions,
    } = this.props;
    this.state = {
      dropdownSelectedItem: member.accountRole || translate(roles[0].label),
      inputValue: member.email,
      isLoading: false,
      typeaheadOptions,
      enableAddMember: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.setTypeaheadComponent = this.setTypeaheadComponent.bind(this);
    this.handleSearchResult = this.handleSearchResult.bind(this);
    this.handleInputChanged = this.handleInputChanged.bind(this);
    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleUpdateClick = this.handleUpdateClick.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
  }

  componentDidMount() {
    const { inputValue } = this.state;
    /* A little bit hacky since react-bootstrap-typeahead
     * doesn't provide method to set the initial value.
     * So I need to get access to their private method (_updateText) to set it manually.
     */
    this.typeahead._updateText(inputValue); // eslint-disable-line no-underscore-dangle
  }

  setTypeaheadComponent(component) {
    if (component != null) {
      this.typeahead = component.getInstance();
    }
  }

  handleChange(eventKey, event) { // eslint-disable-line no-unused-vars
    const { translate } = this.props;
    this.setState({ dropdownSelectedItem: translate(eventKey.label) });
  }

  handleSearchResult(query) {
    const { onSearch } = this.props;
    if (!onSearch) return;
    this.setState({ isLoading: true });
    onSearch(query, (members) => {
      this.setState({ typeaheadOptions: members, isLoading: false });
    });
  }

  handleInputChanged(text) {
    this.setState({
      enableAddMember: PLAYAddMemberForm.checkValidEmail(text),
      inputValue: text,
    });
  }

  handleEnter(event) {
    if (event.key === 'Enter') {
      this.handleAddClick();
    }
  }

  handleAddClick() {
    const { inputValue, dropdownSelectedItem, typeaheadOptions } = this.state;
    const isEmailValid = PLAYAddMemberForm.checkValidEmail(inputValue);
    const { onAdd } = this.props;
    const newMember = typeaheadOptions.filter(member => member.email === inputValue);

    if (!isEmailValid) return;
    if (newMember[0]) {
      onAdd(
        { ...newMember[0], accountRole: dropdownSelectedItem },
        PLAYAddMemberForm.actionType().add,
      );
      this.setState({
        inputValue: '',
      }, () => {
        this.typeahead.clear();
      });
    } else {
      onAdd({
        email: inputValue,
        status: 'pending_confirmation',
        accountRole: dropdownSelectedItem,
      }, PLAYAddMemberForm.actionType().add);
    }
  }

  handleUpdateClick() {
    const { inputValue, dropdownSelectedItem } = this.state;
    const { onUpdate } = this.props;
    onUpdate(
      { email: inputValue, accountRole: dropdownSelectedItem },
      PLAYAddMemberForm.actionType().update,
    );
  }

  render() {
    const {
      placeholder,
      roles,
      customRenderMenuItem,
      labelKey,
      loading,
      minLength,
      onCancel,
      onRemove,
      translate,
      isDisabledTextInput,
      isEdit,
      member,
    } = this.props;
    const {
      dropdownSelectedItem, isLoading, typeaheadOptions, enableAddMember,
    } = this.state;
    const dropdownItems = roles.map((v, index) => (
      <MenuItem key={index} eventKey={v}>
        {translate(v.label)}
      </MenuItem>
    ));

    const actionButton = isEdit ? (
      <div className="play-add-member-form__button-group">
        <PLAYLoadingButton
          disabled={loading.addMember || loading.removeMember || loading.updateMember}
          loading={loading.updateMember}
          onClick={this.handleUpdateClick}
        >
          {translate('components.play_add_member_form.update')}
        </PLAYLoadingButton>
        <PLAYLoadingButton
          className="btn-play-red"
          disabled={loading.addMember || loading.removeMember || loading.updateMember}
          loading={loading.removeMember}
          onClick={() => onRemove(member, PLAYAddMemberForm.actionType().remove)}
        >
          {translate('components.play_add_member_form.remove')}
        </PLAYLoadingButton>
        <PLAYLoadingButton
          className="btn-play-white"
          disabled={loading.addMember || loading.removeMember || loading.updateMember}
          onClick={() => onCancel()}
        >
          {translate('components.play_add_member_form.cancel')}
        </PLAYLoadingButton>
      </div>
    ) : (
      <PLAYLoadingButton
        disabled={!enableAddMember}
        loading={loading.addMember}
        onClick={this.handleAddClick}
      >
        {translate('components.play_add_member_form.add')}
      </PLAYLoadingButton>
    );

    return (
      <div>
        <Form className="play-add-member-form" inline>
          <FormGroup>
            <InputGroup>
              <AsyncTypeahead
                ref={component => this.setTypeaheadComponent(component)}
                className="play-add-member-form__input"
                disabled={isDisabledTextInput}
                filterBy={[labelKey] || ['email', 'id']}
                isLoading={isLoading}
                labelKey={labelKey}
                minLength={minLength}
                onInputChange={this.handleInputChanged}
                onKeyDown={this.handleEnter}
                onSearch={this.handleSearchResult}
                options={typeaheadOptions}
                placeholder={translate(placeholder)}
                renderMenuItemChildren={customRenderMenuItem}
              />
              <DropdownButton
                className="play-add-member-form__dropdown"
                componentClass={InputGroup.Button}
                id="play-add-member-dropdown"
                onSelect={this.handleChange}
                title={upperCaseFirst(dropdownSelectedItem)}
              >
                {dropdownItems}
              </DropdownButton>
            </InputGroup>
          </FormGroup>
          {actionButton}
        </Form>
      </div>
    );
  }
}

PLAYAddMemberForm.propTypes = {
  customRenderMenuItem: PropTypes.func,
  isDisabledTextInput: PropTypes.bool,
  isEdit: PropTypes.bool,
  labelKey: PropTypes.string.isRequired, // This is `key` of the object where points to the value.
  loading: PropTypes.shape({
    addMember: PropTypes.bool,
    removeMember: PropTypes.bool,
    updateMember: PropTypes.bool,
  }),
  member: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    accountRole: PropTypes.string,
    email: PropTypes.string,
  }),
  minLength: PropTypes.number,
  onAdd: PropTypes.func,
  onCancel: PropTypes.func,
  onRemove: PropTypes.func,
  onSearch: PropTypes.func,
  onUpdate: PropTypes.func,
  placeholder: PropTypes.string,
  roles: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })),
  translate: PropTypes.func.isRequired,
  typeaheadOptions: PropTypes.arrayOf(PropTypes.shape({
    email: PropTypes.string,
  })),
};

PLAYAddMemberForm.defaultProps = {
  customRenderMenuItem: null,
  isEdit: false,
  isDisabledTextInput: false,
  placeholder: 'components.play_add_member_form.placeholder',
  minLength: 2,
  loading: {
    addMember: false,
    removeMember: false,
    updateMember: false,
  },
  roles: [{ label: 'components.play_add_member_form.select_item', value: 'select_item' }],
  onAdd: null,
  onRemove: null,
  onCancel: null,
  onSearch: null,
  onUpdate: null,
  member: {
    id: '',
    name: '',
    accountRole: '',
    email: '',
  },
  typeaheadOptions: [],
};

export default localize(PLAYAddMemberForm, 'locale');
