import '../pages/index.css';
import {
  addCard,
  changeLikeCardStatus,
  deleteCard,
  getCardList,
  getUserInfo,
  setUserAvatar,
  setUserInfo,
} from './components/api.js';
import { createCard, updateCardLike } from './components/card.js';
import { closeModal, openModal, setModalCloseListeners } from './components/modal.js';
import {
  clearValidation,
  enableValidation,
  showFormErrors,
  toggleButtonState,
  validateForm,
} from './components/validation.js';
import { renderCardsStats } from './components/statistics.js';

const validationSettings = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__input-error_active',
};

const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileAvatar = document.querySelector('.profile__image');
const profileEditButton = document.querySelector('.profile__edit-button');
const profileAddButton = document.querySelector('.profile__add-button');
const logoButton = document.querySelector('.header__logo-button');

const cardsList = document.querySelector('.places__list');

const popups = Array.from(document.querySelectorAll('.popup'));
const editProfilePopup = document.querySelector('.popup_type_edit');
const newCardPopup = document.querySelector('.popup_type_new-card');
const avatarPopup = document.querySelector('.popup_type_edit-avatar');
const imagePopup = document.querySelector('.popup_type_image');
const removeCardPopup = document.querySelector('.popup_type_remove-card');
const infoPopup = document.querySelector('.popup_type_info');

const editProfileForm = editProfilePopup.querySelector('.popup__form');
const newCardForm = newCardPopup.querySelector('.popup__form');
const avatarForm = avatarPopup.querySelector('.popup__form');
const removeCardForm = removeCardPopup.querySelector('.popup__form');

const nameInput = editProfileForm.querySelector('.popup__input_type_name');
const aboutInput = editProfileForm.querySelector('.popup__input_type_description');
const cardNameInput = newCardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = newCardForm.querySelector('.popup__input_type_url');
const avatarInput = avatarForm.querySelector('.popup__input_type_avatar');

const imagePopupImage = imagePopup.querySelector('.popup__image');
const imagePopupCaption = imagePopup.querySelector('.popup__caption');

const infoElements = {
  definitions: infoPopup.querySelector('.popup-info__definitions'),
  popularCards: infoPopup.querySelector('.popup-info__cards'),
};

let currentUserId = '';
let loadedCards = [];
let cardToDelete = null;
let cardElementToDelete = null;

const renderProfile = (userData) => {
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
  profileAvatar.setAttribute('aria-label', `Обновить аватар ${userData.name}`);
};

const renderCard = (card, container = cardsList, method = 'append') => {
  const cardElement = createCard(
    card,
    currentUserId,
    handleImageClick,
    handleDeleteClick,
    handleLikeClick
  );

  container[method](cardElement);
};

const updateCardsStats = () => {
  if (infoPopup.classList.contains('popup_is-opened')) {
    renderCardsStats(loadedCards, infoElements);
  }
};

function handleImageClick(card) {
  imagePopupImage.src = card.link;
  imagePopupImage.alt = card.name;
  imagePopupCaption.textContent = card.name;
  openModal(imagePopup);
}

function handleDeleteClick(card, cardElement) {
  cardToDelete = card;
  cardElementToDelete = cardElement;
  openModal(removeCardPopup);
}

function handleLikeClick(card, cardElement) {
  const isLiked = card.likes.some((user) => user._id === currentUserId);

  changeLikeCardStatus(card._id, isLiked)
    .then((updatedCard) => {
      loadedCards = loadedCards.map((item) => (item._id === updatedCard._id ? updatedCard : item));
      Object.assign(card, updatedCard);
      updateCardLike(cardElement, updatedCard, currentUserId);
      updateCardsStats();
    })
    .catch((err) => {
      console.error(err);
    });
}

const renderLoading = (isLoading, submitButton, loadingText = 'Сохранение...', defaultText = 'Сохранить') => {
  submitButton.textContent = isLoading ? loadingText : defaultText;
};

const blockInvalidSubmit = (formElement) => {
  const validation = validateForm(formElement, validationSettings);
  const submitButton = formElement.querySelector(validationSettings.submitButtonSelector);

  showFormErrors(formElement, validationSettings);
  toggleButtonState(formElement, validation.inputList, submitButton, validationSettings);

  return submitButton.disabled;
};

const setProfileInitialValues = () => {
  nameInput.dataset.initialValue = nameInput.value.trim();
  aboutInput.dataset.initialValue = aboutInput.value.trim();
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  if (blockInvalidSubmit(editProfileForm)) {
    return;
  }

  const submitButton = editProfileForm.querySelector(validationSettings.submitButtonSelector);
  const defaultText = submitButton.textContent;
  renderLoading(true, submitButton, 'Сохранение...', defaultText);

  setUserInfo({
    name: nameInput.value.trim(),
    about: aboutInput.value.trim(),
  })
    .then((userData) => {
      currentUserId = userData._id;
      renderProfile(userData);
      closeModal(editProfilePopup);
      setProfileInitialValues();
      clearValidation(editProfileForm, validationSettings);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, 'Сохранение...', defaultText);
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();

  if (blockInvalidSubmit(avatarForm)) {
    return;
  }

  const submitButton = avatarForm.querySelector(validationSettings.submitButtonSelector);
  const defaultText = submitButton.textContent;
  renderLoading(true, submitButton, 'Сохранение...', defaultText);

  setUserAvatar({ avatar: avatarInput.value.trim() })
    .then((userData) => {
      currentUserId = userData._id;
      renderProfile(userData);
      closeModal(avatarPopup);
      avatarForm.reset();
      clearValidation(avatarForm, validationSettings);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, 'Сохранение...', defaultText);
    });
};

const handleNewCardFormSubmit = (evt) => {
  evt.preventDefault();

  if (blockInvalidSubmit(newCardForm)) {
    return;
  }

  const submitButton = newCardForm.querySelector(validationSettings.submitButtonSelector);
  const defaultText = submitButton.textContent;
  renderLoading(true, submitButton, 'Создание...', defaultText);

  addCard({
    name: cardNameInput.value.trim(),
    link: cardLinkInput.value.trim(),
  })
    .then((newCard) => {
      loadedCards = [newCard, ...loadedCards];
      renderCard(newCard, cardsList, 'prepend');
      updateCardsStats();
      closeModal(newCardPopup);
      newCardForm.reset();
      clearValidation(newCardForm, validationSettings);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, 'Создание...', defaultText);
    });
};

const handleRemoveCardFormSubmit = (evt) => {
  evt.preventDefault();

  if (!cardToDelete || !cardElementToDelete) {
    return;
  }

  const submitButton = removeCardForm.querySelector(validationSettings.submitButtonSelector);
  const defaultText = submitButton.textContent;
  renderLoading(true, submitButton, 'Удаление...', defaultText);

  deleteCard(cardToDelete._id)
    .then(() => {
      loadedCards = loadedCards.filter((card) => card._id !== cardToDelete._id);
      cardElementToDelete.remove();
      updateCardsStats();
      closeModal(removeCardPopup);
      cardToDelete = null;
      cardElementToDelete = null;
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, 'Удаление...', defaultText);
    });
};

const openEditProfilePopup = () => {
  nameInput.value = profileTitle.textContent;
  aboutInput.value = profileDescription.textContent;
  setProfileInitialValues();
  clearValidation(editProfileForm, validationSettings);
  openModal(editProfilePopup);
};

const openNewCardPopup = () => {
  newCardForm.reset();
  clearValidation(newCardForm, validationSettings);
  openModal(newCardPopup);
};

const openAvatarPopup = () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModal(avatarPopup);
};

const openInfoPopup = () => {
  renderCardsStats(loadedCards, infoElements);
  openModal(infoPopup);
};

profileEditButton.addEventListener('click', openEditProfilePopup);
profileAddButton.addEventListener('click', openNewCardPopup);
profileAvatar.addEventListener('click', openAvatarPopup);
logoButton.addEventListener('click', openInfoPopup);

editProfileForm.addEventListener('submit', handleProfileFormSubmit);
avatarForm.addEventListener('submit', handleAvatarFormSubmit);
newCardForm.addEventListener('submit', handleNewCardFormSubmit);
removeCardForm.addEventListener('submit', handleRemoveCardFormSubmit);

setModalCloseListeners(popups);
enableValidation(validationSettings);

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    loadedCards = cards;

    renderProfile(userData);
    cards.forEach((card) => renderCard(card));
  })
  .catch((err) => {
    console.error(err);
  });
