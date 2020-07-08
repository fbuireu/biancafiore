import React from 'react';

const TextInput = () => <div>
  <label>Your Email:
    <input type={`email`} name={`email`} />
  </label>
</div>;

TextInput.propTypes = {};

TextInput.defaultProps = {};

export default TextInput;

