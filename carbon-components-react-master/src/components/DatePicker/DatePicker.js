import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import flatpickr from 'flatpickr';
import rangePlugin from 'flatpickr/dist/plugins/rangePlugin';
import DatePickerInput from '../DatePickerInput';

// Weekdays shorthand for english locale
flatpickr.l10ns.en.weekdays.shorthand.forEach((day, index) => {
  const currentDay = flatpickr.l10ns.en.weekdays.shorthand;
  if (currentDay[index] === 'Thu' || currentDay[index] === 'Th') {
    currentDay[index] = 'Th';
  } else {
    currentDay[index] = currentDay[index].charAt(0);
  }
});

export default class DatePicker extends Component {
  static propTypes = {
    /**
     * The child nodes.
     */
    children: PropTypes.node,

    /**
     * The CSS class names.
     */
    className: PropTypes.string,

    /**
     * `true` to use the short version.
     */
    short: PropTypes.bool,

    /**
     * The type of the date picker:
     *
     * * `simple` - Without calendar dropdown.
     * * `single` - With calendar dropdown and single date.
     * * `range` - With calendar dropdown and a date range.
     */
    datePickerType: PropTypes.oneOf(['simple', 'single', 'range']),

    /**
     * The date format.
     */
    dateFormat: PropTypes.string,

    /**
     * The value of the `<input>`.
     */
    value: PropTypes.string,

    /**
     * The DOM element the Flatpicker should be inserted into. `<body>` by default.
     */
    appendTo: PropTypes.object,

    /**
     * The `change` event handler.
     */
    onChange: PropTypes.func,
  };

  static defaultProps = {
    short: false,
    dateFormat: 'm/d/Y',
  };

  componentWillUpdate(nextProps) {
    if (nextProps.value !== this.props.value) {
      if (
        this.props.datePickerType === 'single' ||
        this.props.datePickerType === 'range'
      ) {
        this.cal.setDate(nextProps.value);
        this.updateClassNames(this.cal);
      } else {
        if (this.inputField) {
          this.inputField.value = nextProps.value;
        }
      }
    }
  }

  componentDidMount() {
    const { datePickerType, dateFormat, appendTo, onChange } = this.props;
    if (datePickerType === 'single' || datePickerType === 'range') {
      const onHook = (electedDates, dateStr, instance) => {
        this.updateClassNames(instance);
      };
      this.cal = flatpickr(this.inputField, {
        appendTo,
        mode: datePickerType,
        allowInput: true,
        dateFormat: dateFormat,
        plugins:
          datePickerType === 'range'
            ? [new rangePlugin({ input: this.toInputField })]
            : '',
        clickOpens: true,
        nextArrow: this.rightArrowHTML(),
        leftArrow: this.leftArrowHTML(),
        onChange: (...args) => {
          if (onChange) {
            onChange(...args);
          }
        },
        onReady: onHook,
        onMonthChange: onHook,
        onYearChange: onHook,
        onOpen: onHook,
        onValueUpdate: onHook,
      });
      this.addKeyboardEvents(this.cal);
    }
  }

  componentWillUnmount() {
    if (
      this.props.datePickerType === 'range' ||
      this.props.datePickerType === 'single'
    ) {
      this.cal.destroy();
    }
    this.inputField.removeEventListener('change', this.onChange);
    if (this.toInputField) {
      this.toInputField.removeEventListener('change', this.onChange);
    }
  }

  onChange = e => {
    if (e.target.value === '' && this.cal.selectedDates.length > 0) {
      this.cal.clear();
    }
  };

  addKeyboardEvents = cal => {
    const input = this.inputField;
    input.addEventListener('keydown', e => {
      if (e.which === 40) {
        cal.calendarContainer.focus();
      }
    });
    input.addEventListener('change', this.onChange);
    if (this.toInputField) {
      this.toInputField.addEventListener('blur', () => {
        this.cal.close();
      });
      this.toInputField.addEventListener('change', this.onChange);
    }
  };

  rightArrowHTML() {
    return `
      <svg width="8" height="12" viewBox="0 0 8 12" fill-rule="evenodd">
        <path d="M0 10.6L4.7 6 0 1.4 1.4 0l6.1 6-6.1 6z"></path>
      </svg>`;
  }

  leftArrowHTML() {
    return `
      <svg width="8" height="12" viewBox="0 0 8 12" fill-rule="evenodd">
        <path d="M7.5 10.6L2.8 6l4.7-4.6L6.1 0 0 6l6.1 6z"></path>
      </svg>`;
  }

  openCalendar = () => {
    this.cal.open();
  };

  updateClassNames = calendar => {
    const calendarContainer = calendar.calendarContainer;
    const daysContainer = calendar.days;
    calendarContainer.classList.add('bx--date-picker__calendar');
    calendarContainer
      .querySelector('.flatpickr-month')
      .classList.add('bx--date-picker__month');
    calendarContainer
      .querySelector('.flatpickr-weekdays')
      .classList.add('bx--date-picker__weekdays');
    calendarContainer
      .querySelector('.flatpickr-days')
      .classList.add('bx--date-picker__days');
    [...calendarContainer.querySelectorAll('.flatpickr-weekday')].forEach(
      item => {
        const currentItem = item;
        currentItem.innerHTML = currentItem.innerHTML.replace(/\s+/g, '');
        currentItem.classList.add('bx--date-picker__weekday');
      }
    );
    [...daysContainer.querySelectorAll('.flatpickr-day')].forEach(item => {
      item.classList.add('bx--date-picker__day');
      if (
        item.classList.contains('today') &&
        calendar.selectedDates.length > 0
      ) {
        item.classList.add('no-border');
      } else if (
        item.classList.contains('today') &&
        calendar.selectedDates.length === 0
      ) {
        item.classList.remove('no-border');
      }
    });
  };

  assignInputFieldRef = node => {
    this.inputField = !node
      ? null
      : // Child is a regular DOM node, seen in tests
        node.nodeType === Node.ELEMENT_NODE
        ? node.querySelector('.bx--date-picker__input')
        : // Child is a React component
          node.input && node.input.nodeType === Node.ELEMENT_NODE
          ? node.input
          : null;
  };

  assignToInputFieldRef = node => {
    this.toInputField = !node
      ? null
      : // Child is a regular DOM node, seen in tests
        node.nodeType === Node.ELEMENT_NODE
        ? node.querySelector('.bx--date-picker__input')
        : // Child is a React component
          node.input && node.input.nodeType === Node.ELEMENT_NODE
          ? node.input
          : null;
  };

  render() {
    const {
      children,
      className,
      short,
      datePickerType,
      dateFormat, // eslint-disable-line
      ...other
    } = this.props;

    const datePickerClasses = classNames('bx--date-picker', className, {
      'bx--date-picker--short': short,
      'bx--date-picker--simple': datePickerType === 'simple',
      'bx--date-picker--single': datePickerType === 'single',
      'bx--date-picker--range': datePickerType === 'range',
    });

    const datePickerIcon =
      datePickerType === 'range' ? (
        <svg
          onClick={this.openCalendar}
          className="bx--date-picker__icon"
          width="17"
          height="19"
          viewBox="0 0 17 19">
          <path d="M12 0h2v2.7h-2zM3 0h2v2.7H3z" />
          <path d="M0 2v17h17V2H0zm15 15H2V7h13v10z" />
          <path d="M9.9 15H8.6v-3.9H7.1v-.9c.9 0 1.7-.3 1.8-1.2h1v6z" />
        </svg>
      ) : (
        ''
      );

    const childArray = React.Children.toArray(children);
    const childrenWithProps = childArray.map((child, index) => {
      if (index === 0 && child.type === DatePickerInput) {
        return React.cloneElement(child, {
          datePickerType,
          ref: this.assignInputFieldRef,
        });
      } else if (index === 1 && child.type === DatePickerInput) {
        return React.cloneElement(child, {
          datePickerType,
          ref: this.assignToInputFieldRef,
        });
      } else if (index === 0) {
        return React.cloneElement(child, {
          ref: this.assignInputFieldRef,
        });
      } else if (index === 1) {
        return React.cloneElement(child, {
          ref: this.assignToInputFieldRef,
        });
      }
    });
    return (
      <div className="bx--form-item">
        <div className={datePickerClasses} {...other}>
          {childrenWithProps}
          {datePickerIcon}
        </div>
      </div>
    );
  }
}
