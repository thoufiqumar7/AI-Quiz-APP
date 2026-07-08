export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateLogin(values) {
  const errors = {};

  if (!values.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isEmail(values.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!values.password?.trim()) {
    errors.password = 'Password is required';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  return errors;
}

export function validateRegister(values) {
  const errors = validateLogin(values);

  if (!values.name?.trim()) {
    errors.name = 'Name is required';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  return errors;
}
