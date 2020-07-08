import React from 'react';

const TextareaInput = () => <div>
  <label>Message:
    <textarea name={`message`} />
  </label>
</div>;

TextareaInput.propTypes = {};

TextareaInput.defaultProps = {};

export default TextareaInput;

