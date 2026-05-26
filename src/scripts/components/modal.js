const openedPopupClass = 'popup_is-opened';

export const closeModalByEsc = (evt) => {
  if (evt.key === 'Escape') {
    const openedPopup = document.querySelector(`.${openedPopupClass}`);
    if (openedPopup) {
      closeModal(openedPopup);
    }
  }
};

export const closeModalByOverlay = (evt) => {
  if (evt.target === evt.currentTarget) {
    closeModal(evt.currentTarget);
  }
};

export const openModal = (popup) => {
  popup.classList.add(openedPopupClass);
  document.addEventListener('keydown', closeModalByEsc);
};

export const closeModal = (popup) => {
  popup.classList.remove(openedPopupClass);
  document.removeEventListener('keydown', closeModalByEsc);
};

export const setModalCloseListeners = (popups) => {
  popups.forEach((popup) => {
    popup.addEventListener('mousedown', closeModalByOverlay);

    const closeButton = popup.querySelector('.popup__close');
    closeButton.addEventListener('click', () => closeModal(popup));
  });
};
