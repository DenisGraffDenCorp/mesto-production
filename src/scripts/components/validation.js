const textPattern = /^[A-Za-zА-Яа-яЁё -]+$/;

const isImageUrl = (value) => {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const getValidationError = (input) => {
  if (!input) {
    return '';
  }

  const trimmedValue = input.value.trim();
  const validationType = input.dataset.validation;

  if (trimmedValue.length === 0) {
    return 'Заполните это поле';
  }

  if (input.minLength > 0 && trimmedValue.length < input.minLength) {
    return `Минимальное количество символов: ${input.minLength}`;
  }

  if (input.maxLength > -1 && trimmedValue.length > input.maxLength) {
    return `Максимальное количество символов: ${input.maxLength}`;
  }

  if (validationType === 'text' && !textPattern.test(trimmedValue)) {
    return input.dataset.errorMessage ?? 'Разрешены только латинские буквы, кириллица, пробелы и дефис';
  }

  if (validationType === 'image-url' && !isImageUrl(trimmedValue)) {
    return 'Введите корректную ссылку на изображение';
  }

  return '';
};

export const isInputValid = (input) => getValidationError(input) === '';

export const validateForm = (formElement, settings) => {
  if (!formElement) {
    return {
      isValid: false,
      errors: {},
      inputList: [],
    };
  }

  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const errors = inputList.reduce((result, inputElement) => {
    result[inputElement.name] = getValidationError(inputElement);
    return result;
  }, {});

  return {
    isValid: inputList.every(isInputValid),
    errors,
    inputList,
  };
};

const isProfileFormUnchanged = (formElement, inputList) => {
  return (
    formElement.name === 'edit-profile' &&
    inputList.every((inputElement) => inputElement.value.trim() === inputElement.dataset.initialValue)
  );
};

const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
};

const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.textContent = '';
  errorElement.classList.remove(settings.errorClass);
};

const checkInputValidity = (formElement, inputElement, settings) => {
  const errorMessage = getValidationError(inputElement);

  if (errorMessage) {
    showInputError(formElement, inputElement, errorMessage, settings);
  } else {
    hideInputError(formElement, inputElement, settings);
  }
};

export const toggleButtonState = (formElement, inputList, buttonElement, settings) => {
  const validation = validateForm(formElement, settings);

  if (!validation.isValid || isProfileFormUnchanged(formElement, inputList)) {
    buttonElement.disabled = true;
    buttonElement.classList.add(settings.inactiveButtonClass);
  } else {
    buttonElement.disabled = false;
    buttonElement.classList.remove(settings.inactiveButtonClass);
  }
};

const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  toggleButtonState(formElement, inputList, buttonElement, settings);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(formElement, inputList, buttonElement, settings);
    });

    inputElement.addEventListener('blur', () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(formElement, inputList, buttonElement, settings);
    });
  });
};

export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  formList.forEach((formElement) => {
    formElement.addEventListener('submit', (evt) => evt.preventDefault());
    setEventListeners(formElement, settings);
  });
};

export const clearValidation = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach((inputElement) => hideInputError(formElement, inputElement, settings));
  toggleButtonState(formElement, inputList, buttonElement, settings);
};

export const showFormErrors = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));

  inputList.forEach((inputElement) => checkInputValidity(formElement, inputElement, settings));
};
