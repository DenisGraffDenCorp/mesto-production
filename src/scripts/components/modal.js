const openedPopupClass = 'popup_is-opened';

const handleEscClose = (evt) => {
  if (evt.key === 'Escape') {
    const openedPopup = document.querySelector(`.${openedPopupClass}`);
    if (openedPopup) {
      closeModal(openedPopup);
    }
  }
};

export const openModal = (popup) => {
  popup.classList.add(openedPopupClass);
  document.addEventListener('keydown', handleEscClose);
};

export const closeModal = (popup) => {
  popup.classList.remove(openedPopupClass);
  document.removeEventListener('keydown', handleEscClose);
};

export const setModalCloseListeners = (popups) => {
  popups.forEach((popup) => {
    popup.addEventListener('mousedown', (evt) => {
      if (evt.target === popup) {
        closeModal(popup);
      }
    });

    const closeButton = popup.querySelector('.popup__close');
    closeButton.addEventListener('click', () => closeModal(popup));
  });
};
