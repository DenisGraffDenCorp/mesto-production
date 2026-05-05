const textPattern = /^[A-Za-zА-Яа-яЁё -]+$/;
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

const isImageUrl = (value) => {
  try {
    const url = new URL(value);
    const isAllowedProtocol = url.protocol === 'http:' || url.protocol === 'https:';
    const pathname = url.pathname.toLowerCase();
    const hasImageExtension = imageExtensions.some((extension) => pathname.endsWith(extension));

    return isAllowedProtocol && hasImageExtension;
  } catch {
    return false;
  }
};

const getValidationError = (input) => {
  if (!input) {
    return '';
  }

  const trimmedValue = input.value.trim();
  const validationType = input.dataset.validation;

  if (input.validity.valueMissing || trimmedValue.length === 0) {
    return 'Заполните это поле';
  }

  if (input.validity.tooShort) {
    return `Минимальное количество символов: ${input.minLength}`;
  }

  if (input.validity.tooLong) {
    return `Максимальное количество символов: ${input.maxLength}`;
  }

  if (validationType === 'text' && !textPattern.test(trimmedValue)) {
    return 'Разрешены только латинские буквы, кириллица, пробелы и дефис';
  }

  if (validationType === 'image-url' && !isImageUrl(trimmedValue)) {
    return 'Введите корректную ссылку на изображение';
  }

  if (input.validity.patternMismatch) {
    return input.getAttribute('data-error-message') ?? 'Неверный формат';
  }

  if (!input.validity.valid) {
    return input.validationMessage;
  }

  return '';
};

const isProfileFormUnchanged = (formElement, inputList) => {
  return (
    formElement.name === 'edit-profile' &&
    inputList.every((inputElement) => inputElement.value === inputElement.dataset.initialValue)
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

const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => getValidationError(inputElement) !== '');
};

const toggleButtonState = (formElement, inputList, buttonElement, settings) => {
  if (hasInvalidInput(inputList) || isProfileFormUnchanged(formElement, inputList)) {
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
