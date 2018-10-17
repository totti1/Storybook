import PropTypes from 'prop-types';
import React from 'react';
import uid from '../../tools/uniqueId';
import Icon from '../Icon';
import classNames from 'classnames';

export default class RadioTile extends React.Component {
  static propTypes = {
    checked: PropTypes.bool,
    defaultChecked: PropTypes.bool,
    id: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };

  static defaultProps = {
    onChange: () => {},
  };

  componentWillMount() {
    this.uid = this.props.id || uid();
  }

  handleChange = evt => {
    this.props.onChange(this.props.value, this.props.name, evt);
  };

  render() {
    const { children, ...other } = this.props;

    const classes = classNames('bx--tile', 'bx--tile--selectable', {
      'bx--tile--is-selected': this.props.checked,
    });

    return (
      <label htmlFor={this.uid} className={classes}>
        <input
          {...other}
          type="radio"
          className="bx--tile-input"
          onChange={this.handleChange}
          id={this.uid}
        />

        <div className="bx--tile__checkmark">
          <Icon name="checkmark--glyph" description="Tile checkmark" />
        </div>
        <div className="bx--tile-content">{children}</div>
      </label>
    );
  }
}
